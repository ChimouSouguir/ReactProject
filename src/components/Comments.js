import React, { useState, useEffect } from "react";
import { supabase } from "../client";
import "./Comments.css";
import { useAuth0 } from "@auth0/auth0-react";
import ModalAlert from "./ModalAlert";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

function Comments({ songId, style }) {
  const { isAuthenticated, user, logout } = useAuth0();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [roles, setRoles] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      if (isAuthenticated) {
        try {
          const { data: userData, error } = await supabase
            .from("users")
            .select("role, warnings")
            .eq("email", user.email)
            .single();

          if (error) throw error;

          setRoles([userData.role]);
          setWarningCount(userData.warnings || 0);
        } catch (error) {
          console.error("Error fetching roles:", error.message);
        }
      }
    };

    fetchRoles();
  }, [isAuthenticated, user.email]);

  useEffect(() => {
    const subscription = supabase
      .from("comments")
      .on("INSERT", (payload) => {
        if (payload.new.approved) {
          setComments((prevComments) => [payload.new, ...prevComments]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [songId]);

  useEffect(() => {
    fetchComments();
  }, [songId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("song_id", songId)
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error.message);
    }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      alert("Please log in to add a comment");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comments: [newComment] }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const predictedLabel = data[0].toxicity_label;

      if (predictedLabel === "toxic") {
        const newWarningCount = warningCount + 1;
        setWarningCount(newWarningCount);

        if (newWarningCount >= 3) {
          setModalContent({
            type: "negative",
            message: "Your account has been deleted due to multiple negative comments.",
          });
          setShowModal(true);
          logout();
          return;
        }

        setModalContent({
          type: "negative",
          message: `Negative comment detected. Your account has ${3 - newWarningCount} warnings left before deletion.`,
        });
        setShowModal(true);
        return;
      }

      const { error } = await supabase
        .from("comments")
        .insert({
          song_id: songId,
          user_email: user.email,
          user_name: user.name,
          comment: newComment,
          approved: false,
        });

      if (error) throw error;
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error.message);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditedComment(comment.comment);
  };

  const handleUpdateComment = async () => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ comment: editedComment, approved: false })
        .eq("id", editingCommentId);

      if (error) throw error;

      setEditingCommentId(null);
      setEditedComment("");
      fetchComments();
    } catch (error) {
      console.error("Error updating comment:", error.message);
    }
  };

  const handleOpenConfirmDelete = (commentId) => {
    setCommentToDelete(commentId);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    await handleDeleteComment(commentToDelete);
    setShowConfirmDelete(false);
    setCommentToDelete(null);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error.message);
    }
  };

  const handleApproveComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ approved: true })
        .eq("id", commentId);

      if (error) throw error;
      fetchComments();
    } catch (error) {
      console.error("Error approving comment:", error.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent({});
  };

  return (
    <div className="comments-section" style={style}>
      <h4>Commentaires</h4>
      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <p>
            <strong>{comment.user_name}</strong>:{" "}
            {editingCommentId === comment.id ? (
              <>
                <textarea
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                />
                <button onClick={handleUpdateComment}>Sauvegarder</button>
              </>
            ) : (
              comment.comment
            )}
          </p>
          <small>{new Date(comment.created_at).toLocaleString()}</small>
          {roles.includes("admin") && !comment.approved && (
            <button onClick={() => handleApproveComment(comment.id)}>Approuver</button>
          )}
          {isAuthenticated && comment.user_email === user.email && (
            <div className="comment-actions">
              <FaEdit className="icon edit" onClick={() => handleEditComment(comment)} />
              <FaTrashAlt className="icon delete" onClick={() => handleOpenConfirmDelete(comment.id)} />
            </div>
          )}
        </div>
      ))}
      {isAuthenticated && (
        <div className="add-comment">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire"
          ></textarea>
          <button onClick={handleAddComment}>Post Comment</button>
        </div>
      )}

      {/* Modal pour alertes */}
      {showModal && (
        <ModalAlert
          type={modalContent.type}
          message={modalContent.message}
          onClose={closeModal}
        />
      )}

      {/* Modal pour confirmation */}
      {showConfirmDelete && (
        <div className="confirm-delete-modal">
          <h5>Delete Confirmation</h5>
          <p>Sure to delete this comment ?</p>
          <button onClick={handleConfirmDelete}>Yes, Delete</button>
          <button onClick={() => setShowConfirmDelete(false)}>No</button>
        </div>
      )}
    </div>
  );
}

export default Comments;
