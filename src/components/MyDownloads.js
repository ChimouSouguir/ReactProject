import React, { useState, useEffect } from "react";
import { supabase } from "../client";
import { Card, Row, Col, Button, Modal } from "react-bootstrap";
import moment from "moment";
import { useAuth0 } from "@auth0/auth0-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import '../styles.css'; 
import backgroundImage from '../components/images/navbar1.jpg'; // Import the image
// Import the CSS file

export default function MyDownloadsPage() {
  const { user } = useAuth0();
  const [downloadedSongs, setDownloadedSongs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);
  const [filterToday, setFilterToday] = useState(false);

  useEffect(() => {
    fetchDownloadedSongs();
  }, []);

  const fetchDownloadedSongs = async () => {
    try {
      const { data, error } = await supabase
        .from("downloads")
        .select("*")
        .eq("name", user ? user.name : "")
        .order("downloaded_at", { ascending: false });

      if (error) {
        throw error;
      }

      setDownloadedSongs(data);
    } catch (error) {
      console.error("Error fetching downloaded songs:", error.message);
    }
  };

  const handleDeleteClick = (song) => {
    setSongToDelete(song);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from("downloads")
        .delete()
        .eq("id", songToDelete.id);

      if (error) {
        throw error;
      }

      setDownloadedSongs(downloadedSongs.filter(song => song.id !== songToDelete.id));
      setShowDeleteModal(false);
      setSongToDelete(null);
    } catch (error) {
      console.error("Error deleting song:", error.message);
    }
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setSongToDelete(null);
  };

  const filteredSongs = filterToday
    ? downloadedSongs.filter(song => moment(song.downloaded_at).isSame(moment(), 'day'))
    : downloadedSongs;

  return (
  <div
    className="my-downloads-container"
    style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '20px',
      borderRadius: '10px',
    }}
  >
    <div className="my-downloads-container">
      <strong>
      <h1 className="mb-4">🎶 My Downloads 🎶</h1>

      </strong>
      <Button variant="primary" onClick={() => setFilterToday(!filterToday)}>
        {filterToday ? "Show All Downloads" : "Show Downloads Today"}
      </Button>
      {filteredSongs.length === 0 ? (
        <p>No music downloaded {filterToday ? "today" : "yet"}.</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredSongs.map((song, index) => (
            <Col key={index}>
              <Card className="card animated-card">
                <Card.Body>
                  <Card.Title>{song.title}</Card.Title>
                  <Card.Text>
                    <span>Downloaded At:</span>{" "}
                    {moment(song.downloaded_at).format("YYYY-MM-DD HH:mm:ss")}
                  </Card.Text>
                  <audio controls src={song.url}></audio>
                  <Button
                    variant="danger"
                    className="delete-button"
                    onClick={() => handleDeleteClick(song)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Confirmation delete modal */}
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
