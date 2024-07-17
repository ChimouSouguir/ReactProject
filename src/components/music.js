import React, { useState, useEffect } from "react";
import ReactAudioPlayer from "react-audio-player";
import { Button, Modal } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { supabase } from "../client";
import StarRatings from "react-star-ratings";
import { FaAngry, FaHeart, FaLaugh, FaThumbsUp } from "react-icons/fa";
import { Howl } from "howler";
import './App.css';
import AuthModal from './AuthModal';
import thumbSoundSrc from './Sounds/thumb-sound.mp3';
import heartSoundSrc from './Sounds/heart-sound.mp3';
import laughSoundSrc from './Sounds/laugh-sound.mp3';
import "./Music.css";
import Comments from './Comments';

// Styles specific to this component
// Styles specific to this component
const commentStyle = {
  maxHeight: "200px",
  overflowY: "auto",
};


export default function Music({ music }) {
  const { isAuthenticated, user } = useAuth0();
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reactions, setReactions] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [filteredReactions, setFilteredReactions] = useState([]);
  const [commentsOpen, setCommentsOpen] = useState(false); // État pour gérer l'ouverture des commentaires

  const heartSound = new Howl({ src: [heartSoundSrc] });
  const thumbSound = new Howl({ src: [thumbSoundSrc] });
  const laughSound = new Howl({ src: [laughSoundSrc] });
  const colors = ['#FFDDC1', '#CFE2FF', '#D1E7DD'];

  useEffect(() => {
    fetchRating();
    fetchReactions();
  }, []);

  const fetchRating = async () => {
    try {
      const { data, error } = await supabase
        .from("ratings")
        .select("rating")
        .eq("song_id", music.id_song);

      if (error) {
        throw error;
      }

      if (data.length > 0) {
        const totalRating = data.reduce((acc, curr) => acc + curr.rating, 0);
        const avgRating = totalRating / data.length;
        setAverageRating(avgRating);
      }
    } catch (error) {
      console.error("Error fetching rating:", error.message);
    }
  };

  const handleRatingChange = async (newRating) => {
    try {
      if (!isAuthenticated) {
        setShowAuthModal(true);
        return;
      }
  
      const userEmail = user.email;
      setRating(newRating);
  
      // Upsert la nouvelle évaluation dans la table ratings
      const { error: ratingError } = await supabase
        .from("ratings")
        .upsert(
          { user_email: userEmail, song_id: music.id_song, rating: newRating },
          { returning: "minimal" }
        );
  
      if (ratingError) {
        throw ratingError;
      }
  
      // Récupère toutes les évaluations pour la chanson spécifique
      const { data, error: fetchError } = await supabase
        .from("ratings")
        .select("rating")
        .eq("song_id", music.id_song);
  
      if (fetchError) {
        throw fetchError;
      }
  
      // Calcul de la moyenne des évaluations
      const totalRating = data.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = totalRating / data.length;
  
      // Met à jour l'average rating dans la table ratings
      const { updateError } = await supabase
        .from("ratings")
        .update({ average_rating: avgRating })
        .eq("song_id", music.id_song);
  
      if (updateError) {
        throw updateError;
      }
  
      // Met à jour ou insère l'average rating dans la table song_average_ratings
      const { avgData, avgError } = await supabase
        .from("song_average_ratings")
        .upsert(
          { song_title: music.title, average_rating: avgRating },
          { returning: "minimal" }
        )
        .eq("song_title", music.title); // Filtre pour s'assurer qu'il n'y a qu'une seule ligne par titre de chanson
  
      if (avgError) {
        throw avgError;
      }
  
      // Met à jour l'average rating dans l'état local
      setAverageRating(avgRating);
  
    } catch (error) {
      console.error("Error adding or updating rating:", error.message);
    }
  };
  
  

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from("reactions")
        .select("*")
        .eq("song_id", music.id_song);

      if (error) {
        throw error;
      }

      setReactions(data);
    } catch (error) {
      console.error("Error fetching reactions:", error.message);
    }
  };

  const handleReaction = async (reactionType) => {
    try {
      if (!isAuthenticated) {
        setShowAuthModal(true);
        return;
      }

      const userEmail = user.email;
      const userName = user.name;
      const existingReaction = reactions.find((r) => r.user_email === userEmail);

      if (existingReaction) {
        // Update reaction
        const { error } = await supabase
          .from("reactions")
          .update({ reaction_type: reactionType })
          .eq("id", existingReaction.id);

        if (error) {
          throw error;
        }
      } else {
        // Insert new reaction
        const { error } = await supabase
          .from("reactions")
          .insert({
            user_email: userEmail,
            user_name: userName,
            song_id: music.id_song,
            reaction_type: reactionType,
          });

        if (error) {
          throw error;
        }
      }

      playReactionSound(reactionType);
      await fetchReactions();
    } catch (error) {
      console.error("Error handling reaction:", error.message);
    }
  };

  const playReactionSound = (reactionType) => {
    if (reactionType === "heart") {
      heartSound.play();
    } else if (reactionType === "thumb") {
      thumbSound.play();
    }else if (reactionType === "angry") {
      thumbSound.play();
    }else if (reactionType === "laugh") {
      laughSound.play();
    }
  };

  const openReactionsModal = (reactionType) => {
    const filtered = reactions.filter((r) => r.reaction_type === reactionType);
    setFilteredReactions(filtered);
    setShowReactionsModal(true);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(music.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = music.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (isAuthenticated) {
        await recordDownload();
        console.log('User roles:', user?.app_metadata?.roles);

      }
    } catch (error) {
      console.error("Error downloading file:", error.message);
    }
  };

  const recordDownload = async () => {
    const downloadInfo = {
      url: music.url,
      title: music.title,
      downloaded_at: new Date().toISOString(),
      name: user.name,
    };

    try {
      const { data: downloadData, error: downloadError } = await supabase
        .from("downloads")
        .insert([downloadInfo]);

      if (downloadError) {
        throw downloadError;
      }

      console.log("Download recorded successfully:", downloadData);
      await fetchAdditionalInfo(music.url, music.title, user.name);
    } catch (error) {
      console.error("Error recording download:", error.message);
    }
  };

  const fetchAdditionalInfo = async (url, songTitle, downloaderName) => {
    try {
      const { data: songData, error: songError } = await supabase
        .from("download_song")
        .select("user_email")
        .eq("url", url)
        .single();
  
      if (songError) {
        throw songError;
      }
  
      if (!songData) {
        console.log("No additional info found for this URL:", url);
        return; // Aucune information supplémentaire trouvée, on peut sortir de la fonction
      }
  
      const userEmail = songData.user_email;
      console.log("Uploader's email:", userEmail);
      await sendDownloadEmail(
        userEmail,
        `Your song "${songTitle}" was downloaded`,
        `${downloaderName} has downloaded your song.`
      );
    } catch (error) {
      console.error("Error fetching additional info:", error.message);
    }
  };
  
  const sendDownloadEmail = async (to, subject, text) => {
    try {
      console.log("Sending email with the following details:", {
        to,
        subject,
        text,
      });

      const response = await fetch("http://localhost:4000/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, subject, text }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to send email:", errorText);
        throw new Error(`Failed to send email: ${errorText}`);
      }

      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error.message);
    }
  };

  return (
    <div className="col-md-4">
      <div className="card p-3 mb-2 animate-card">
        <div className="d-flex justify-content-between">
          <div className="d-flex flex-row align-items-center">
            <div className="icon bounce">
              <i className="bx bxl-mailchimp"></i>
            </div>
            <div className="ms-2 c-details">
              <h6 className="mb-0">{music.name}</h6>
              <span>{music.created_at}</span>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <h4 className="heading">{music.title}</h4>
          <div className="mt-2">
            <ReactAudioPlayer src={music.url} controls />
            {isAuthenticated && (
              <Button onClick={handleDownload} variant="primary" className="mt-2 animate-button">
                Download
              </Button>
            )}
            <StarRatings
              rating={rating}
              starRatedColor="#f8d231"
              changeRating={handleRatingChange}
              numberOfStars={5}
              name={`rating-${music.id_song}`}
            />
            <p className="average-rating">
              <span className="average-icon">★</span>
              <span className="average-text">Average Rating:</span>
              <span className="average-value">{averageRating.toFixed(1)}</span>
            </p>
            <div className="reactions">
              <FaHeart className="reaction-icon heart" onClick={() => handleReaction("heart")} />
              <FaThumbsUp className="reaction-icon thumb" onClick={() => handleReaction("thumb")} />
              <FaLaugh className="reaction-icon laugh" onClick={() => handleReaction("laugh")} />
              <FaAngry className="reaction-icon angry" onClick={() => handleReaction("angry")} />
              <button className="btn btn-link" onClick={() => setShowReactionsModal(true)}>
                View Reactions
              </button>
            </div>
            <Button onClick={() => setCommentsOpen(!commentsOpen)} className="mt-2">
              {commentsOpen ? "Hide Comments" : "Show Comments"}
            </Button>
            {commentsOpen && <Comments songId={music.id_song} />}
          </div>
        </div>
      </div>

      <AuthModal show={showAuthModal} onHide={() => setShowAuthModal(false)} />

      <Modal show={showReactionsModal} onHide={() => setShowReactionsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reactions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="reaction-buttons">
            <Button variant="outline-danger" onClick={() => openReactionsModal('heart')}>Hearts</Button>
            <Button variant="outline-primary" onClick={() => openReactionsModal('thumb')}>Thumbs Up</Button>
            <Button variant="outline-warning" onClick={() => openReactionsModal('laugh')}>Laugh</Button>
            <Button variant="outline-danger" onClick={() => openReactionsModal('angry')}>Angry</Button>
          </div>
          <ul className="reaction-list">
          {filteredReactions.map((reaction, index) => (
  <li key={index} >
    {/* style={{ backgroundColor: colors[index % colors.length] }} */}
    <strong>
      {reaction.user_name} reacted with {getReactionEmoji(reaction.reaction_type)}
    </strong>
  </li>
))}

          </ul>
        </Modal.Body>
      </Modal>
    </div>
  );
}

function getReactionEmoji(reactionType) {
  switch (reactionType) {
    case "heart":
      return "❤️";
    case "thumb":
      return "👍";
    case "laugh":
      return "😂";
    case "angry":
      return "😡";
    default:
      return "";
  }
}


