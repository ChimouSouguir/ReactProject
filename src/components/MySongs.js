import React, { useState, useEffect } from "react";
import { supabase } from "../client";
import { Card, Row, Col, Button, Modal } from "react-bootstrap";
import moment from "moment";
import { useAuth0 } from "@auth0/auth0-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faEdit } from "@fortawesome/free-solid-svg-icons";
import '../styles.css'; // Assurez-vous que le CSS est bien importé
import backgroundImage from '../components/images/pho.png'; // Import the image
import './MySongs.css'; // Assurez-vous que le CSS est bien importé



export default function MySongsPage() {
  const { user } = useAuth0();
  const [MySongs, setMySongs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);
  const [editingSongId, setEditingSongId] = useState(null);
  const [editedSong, setEditedSong] = useState("");

  useEffect(() => {
    fetchMySongs();
  }, []);

  const fetchMySongs = async () => {
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("name", user ? user.name : "")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setMySongs(data);
    } catch (error) {
      console.error("Error fetching My songs:", error.message);
    }
  };

  const handleDeleteClick = (song) => {
    setSongToDelete(song);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!songToDelete) {
      console.error("No song selected for deletion");
      return;
    }

    try {
      const { error } = await supabase
        .from("songs")
        .delete()
        .eq("id_song", songToDelete.id_song);

      if (error) {
        throw error;
      }

      setMySongs(MySongs.filter(song => song.id_song !== songToDelete.id_song));
      setShowDeleteModal(false);
      setSongToDelete(null);
    } catch (error) {
      console.error("Error deleting song:", error.message);
    }
  };

  const handleEditSong = (song) => {
    setEditingSongId(song.id_song);
    setEditedSong(song.song);
  };

  const handleUpdateSong = async () => {
    try {
      const { error } = await supabase
        .from("songs")
        .update({ song: editedSong })
        .eq("id_song", editingSongId);

      if (error) throw error;

      setEditingSongId(null);
      setEditedSong("");
      fetchMySongs();
    } catch (error) {
      console.error("Error updating Song:", error.message);
    }
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setSongToDelete(null);
  };

  return (
    
    <div className="my-downloads-container">
       <div
       
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '20px',
          borderRadius: '10px',
        }}
      >
      <h1 className="mb-4">🎶 My Songs 🎶</h1>
      <Row xs={1} md={2} lg={3} className="g-4">
        {MySongs.map((song, index) => (
          <Col key={index}>
            <Card className="card">
              
              <Card.Body>
                <Card.Title>🎶 {song.title}</Card.Title>
                <Card.Text>
                  <span>Uploaded At:</span>{" "}
                  {moment(song.created_at).format("YYYY-MM-DD HH:mm:ss")}
                </Card.Text>
                <audio controls src={song.url}></audio>
                {editingSongId === song.id_song ? (
                  <>
                    <textarea
                      value={editedSong}
                      onChange={(e) => setEditedSong(e.target.value)}
                    />
                    <Button onClick={handleUpdateSong}>Save</Button>
                  </>
                ) : (
                  <p>{song.song}</p>
                )}
               <div className="song-actions">
  <Button
    variant="warning"
    className="edit-button"
    onClick={() => handleEditSong(song)}
  >
    <FontAwesomeIcon icon={faEdit} />
  </Button>
  <Button
    variant="danger"
    className="delete-button"
    onClick={() => handleDeleteClick(song)}
  >
    <FontAwesomeIcon icon={faTrashAlt} />
  </Button>
</div>


              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={handleDeleteModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this song?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteModalClose}>
            No
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    </div>
  );
}
