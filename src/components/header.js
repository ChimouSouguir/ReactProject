


import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navbar, Nav, NavDropdown, Button, Modal, Badge, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBell, faGamepad, faUpload,faChalkboardTeacher ,faUserEdit} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { supabase } from '../client';
import Login from './login-button';
import Logout from './logout-button';
import AdvancedMusicNoteGame from './AdvancedMusicNoteGame';
import MemoryGame from './MemoryGame';
import InstrumentsIdentification from './InstrumentsIdentification';
import SimpleComposer from './SimpleComposer';
import './Header.css';
import LessonManagement from './LessonManagement';
import './animations.css'; // Vérifie que le chemin est correct
import './navbar.css'; // Vérifie que le chemin est correct
import './welcome'; // Vérifie que le chemin est correct
import MyLessons from './MyLessons';






export default function Header() {
  const { isAuthenticated, user } = useAuth0();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [genre, setGenre] = useState('');
  const [customGenre, setCustomGenre] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [genres, setGenres] = useState(['Pop', 'Rock', 'Jazz', 'Classical', 'Other']);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showMemoryGameModal, setShowMemoryGameModal] = useState(false);
  const [showInstrumentsModal, setShowInstrumentsModal] = useState(false);
  const [showComposerModal, setShowComposerModal] = useState(false);
  const [showTeacherRequestModal, setShowTeacherRequestModal] = useState(false);
  const [teacherRequestReason, setTeacherRequestReason] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  
  const handleProfileModalClose = () => {
    setShowProfileModal(false);
    setIsEditing(false); // Reset editing state when closing modal
  };

  const handleProfileModalShow = () => {
    setShowProfileModal(true);
    setUserName(user?.name || ''); // Populate with current user data
    setUserEmail(user?.email || '');
  };

  const handleEditClick = () => setIsEditing(true);
 

  // Similar state and useEffect functions as in your original code
  const handlePlayGameClick = () => {
    setShowGameModal(true);
  };

  const handleCloseGameModal = () => {
    setShowGameModal(false);
  };

  const handlePlayMemoryGameClick = () => {
    setShowMemoryGameModal(true);
  };

  const handleCloseMemoryGameModal = () => {
    setShowMemoryGameModal(false);
  };

  const handlePlayComposerClick = () => {
    setShowComposerModal(true);
  };

  const handleCloseComposerModal = () => {
    setShowComposerModal(false);
  };

  const handlePlayInstrumentsGameClick = () => {
    setShowInstrumentsModal(true);
  };

  const handleCloseInstrumentsModal = () => {
    setShowInstrumentsModal(false);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      insertOrUpdateUser(user);
      checkAdminStatus();
      checkTeacherStatus();
    
    }
  }, [isAuthenticated, user]);
 

  const insertOrUpdateUser = async (userData) => {
    try {
      const { data: existingUsers, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', userData.email)
        .limit(1);

      if (error) {
        throw error;
      }

      if (existingUsers.length > 0) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: userData.name,
            role: userData.role,
          })
          .eq('email', userData.email);

        if (updateError) {
          throw updateError;
        }
      } else {
        const userRecord = {
          user_id: userData.sub,
          email: userData.email,
          name: userData.name,
        };

        if (userData.role) {
          userRecord.role = userData.role;
        }

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([userRecord]);

        if (insertError) {
          throw insertError;
        }
      }
    } catch (error) {
      console.error('Error inserting/updating user:', error.message);
    }
  };
  const handleProfileUpdate = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: userName, email: userEmail })
        .eq('user_id', user.sub); // Assuming user.sub is the unique identifier
  
      if (error) {
        console.error('Error updating profile:', error.message);
        alert('Failed to update profile. Please try again.');
      } else {
        alert('Profile updated successfully!');
        handleProfileModalClose(); // Close the modal after update
      }
    } catch (error) {
      console.error('Unexpected error during profile update:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };
  

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Error fetching user role:', error.message);
      } else {
        setIsAdmin(data.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error.message);
    }
  };
  const checkTeacherStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Error fetching user role:', error.message);
      } else {
        setIsTeacher(data.role === 'teacher'); // Set isTeacher based on user role
      }
    } catch (error) {
      console.error('Error checking teacher status:', error.message);
    }
  };
  

  const handleNotificationsModalClose = () => setShowNotificationsModal(false);
  const handleNotificationsModalShow = () => {
    setShowNotificationsModal(true);
    markNotificationsAsRead();
  };

  const markNotificationsAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_email', user.email)
        .eq('read', false);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error.message);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data);
      setUnreadCount(data.filter((notification) => !notification.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
    }
  };

  const handleGenreModalClose = () => {
    console.log("Closing genre modal");

    setShowGenreModal(false);
    setGenre('');
    setCustomGenre('');
    setSongTitle('');
  };

  const handleGenreModalShow = () => {
    console.log("Showing genre modal");

    setShowGenreModal(true);}

  const handleGenreSubmit = () => {
    const selectedGenre = genre === 'Other' ? customGenre : genre;
    if (selectedGenre && songTitle) {
      console.log("Submitting genre modal with:");
    console.log("Selected Genre:", selectedGenre);
    console.log("Song Title:", songTitle);
      handleUploadClick(selectedGenre, songTitle);
      handleGenreModalClose();
    } else {
      alert('Please select a genre and enter a title.');
    }
  };

  const handleUploadClick = (selectedGenre, songTitle) => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dp2jwmyma',
        uploadPreset: 'xtd2dztq',
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return;
        }
        if (result.event === 'success') {
          console.log('Cloudinary upload result:', result);

          const url = result.info.secure_url;
          const name = user ? user.name : '';
          const email = user ? user.email : '';

          console.log('Calling createSong with:', { url, title: songTitle, name, email, selectedGenre });

          await createSong(url, songTitle, name, email, selectedGenre);
        }
      }
    );
    widget.open();
  };

  const createSong = async (url, title, name, email, genre) => {
    try {
      if (!title) {
        console.error('Title is undefined or empty');
        alert('Failed to upload the song: Title is undefined or empty.');
        return;
      }

      console.log('Inserting song with the following details:', {
        url,
        title,
        name,
        email,
        genre,
      });

      const { data, error } = await supabase
        .from('songs')
        .insert([
          {
            url,
            title,
            name,
            email,
            genre,
            created_at: new Date().toISOString(),
          },
        ])
        .single();

      if (error) {
        console.error('Error inserting song:', error.message);
        alert('Failed to upload the song. Please try again.');
      } else {
        console.log('Song inserted successfully:', data);
        alert('Song uploaded successfully!');
      }
    } catch (error) {
      console.error('Unexpected error during song insertion:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };
  const handleTeacherRequestModalClose = () => setShowTeacherRequestModal(false);
  const handleTeacherRequestModalShow = () => setShowTeacherRequestModal(true);

  const handleTeacherRequestSubmit = async () => {
    if (!teacherRequestReason) {
      alert('Please provide a reason for the request.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('teacher_requests')
        .insert([
          {
            user_id: user.sub,
            name: user.name,

            email: user.email,
            reason: teacherRequestReason,
          },
        ])
        .single();

      if (error) {
        console.error('Error submitting teacher request:', error.message);
        alert('Failed to submit the request. Please try again.');
        return;
      }

      alert('Teacher request submitted successfully!');
      handleTeacherRequestModalClose();
    } catch (error) {
      console.error('Error creating teacher request:', error.message);
    }
  };



  
  return (
    <Navbar bg="light" expand="lg" className="animated-navbar">
      <Navbar.Brand as={Link} to="/" className="logo">Composia</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          <Nav.Link as={Link} to="/downloads">Downloads</Nav.Link>
          {isAuthenticated && (
            <>
              <Nav.Link as={Link} to="/MyDownloads">My Downloads</Nav.Link>
              <Nav.Link as={Link} to="/MySongs">My Songs</Nav.Link>
              <Nav.Link as={Link} to="/Teacher-Lessons">Lessons</Nav.Link>
              {isAdmin && (
                <Nav.Link as={Link} to="/admin">Dashboard Admin</Nav.Link>
              )}
              {isTeacher && (
                <>
                <Nav.Link as={Link} to="/lesson-management">Manage Lessons</Nav.Link>
                <Nav.Link as={Link} to="/MyLessons">My Lessons</Nav.Link>
                </>
              )}
            </>
          )}
        </Nav>
        <Nav>
          <NavDropdown title={<span><FontAwesomeIcon icon={faGamepad} /> Games</span>} id="basic-nav-dropdown">
            <NavDropdown.Item onClick={() => setShowGameModal(true)}>Advanced Music Note Game</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setShowMemoryGameModal(true)}>Memory Game</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setShowInstrumentsModal(true)}>Instruments Identification Game</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setShowComposerModal(true)}>Simple Composer</NavDropdown.Item>
          </NavDropdown>
          <Nav.Item>
            <Button className="upload-button" onClick={handleGenreModalShow}>
              <FontAwesomeIcon icon={faUpload} /> Upload Song
            </Button>
          </Nav.Item>
          <Button
  className="request-button"
  onClick={handleTeacherRequestModalShow}
  style={{ color: 'red', backgroundColor: 'white',border: '2px solid red' }}
>
  <FontAwesomeIcon icon={faChalkboardTeacher} /> Request Teacher Access
</Button>
          <Nav.Item>
            <Button className="notifications-button" onClick={handleNotificationsModalShow}>
              <FontAwesomeIcon icon={faBell} />
              {unreadCount > 0 && <Badge bg="danger">{unreadCount}</Badge>}
            </Button>
          </Nav.Item>
          <Nav.Item>
            <Button className="profile-button" onClick={handleProfileModalShow}>
              <FontAwesomeIcon icon={faUser} />
            </Button>
          </Nav.Item>
          <Nav.Item>
            {isAuthenticated ? <Logout /> : <Login />}
          </Nav.Item>
        </Nav>
      </Navbar.Collapse>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={handleProfileModalClose} className="animated-modal">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form>
            <Form.Group controlId="formUserName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                readOnly={!isEditing}
              />
            </Form.Group>
            <Form.Group controlId="formUserEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                readOnly={!isEditing}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={handleProfileModalClose}>Cancel</Button>
              <Button variant="primary" onClick={handleProfileUpdate}>Update</Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              <FontAwesomeIcon icon={faUserEdit} size="lg" /> Update Info
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Notifications Modal */}
      <Modal show={showNotificationsModal} onHide={() => setShowNotificationsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li key={notification.id}>{notification.message}</li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleNotificationsModalClose}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Genre Modal */}
      <Modal show={showGenreModal} onHide={() => setShowGenreModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Genre and Enter Title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formGenre">
              <Form.Label>Genre</Form.Label>
              <Form.Control
                as="select"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                <option value="">Select a genre...</option>
                {genres.map((genreOption) => (
                  <option key={genreOption} value={genreOption}>
                    {genreOption}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            {genre === 'Other' && (
              <Form.Group controlId="formCustomGenre">
                <Form.Label>Custom Genre</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter custom genre"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  tabIndex="1"
                />
              </Form.Group>
            )}
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter song title"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleGenreModalClose}>Close</Button>
          <Button variant="primary" onClick={handleGenreSubmit}>Upload</Button>
        </Modal.Footer>
      </Modal>

      {/* Game Modals */}
      <Modal show={showGameModal} onHide={handleCloseGameModal} size="md">
        <Modal.Header closeButton>
          <Modal.Title>Advanced Music Note Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AdvancedMusicNoteGame />
        </Modal.Body>
      </Modal>

      <Modal show={showMemoryGameModal} onHide={handleCloseMemoryGameModal}  className="custom-modal-xl">
        <Modal.Header closeButton>
          <Modal.Title>Memory Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MemoryGame />
        </Modal.Body>
      </Modal>

      <Modal show={showInstrumentsModal} onHide={handleCloseInstrumentsModal} >
        <Modal.Header closeButton>
          <Modal.Title>Instruments Identification Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InstrumentsIdentification />
        </Modal.Body>
      </Modal>

      <Modal show={showComposerModal} onHide={handleCloseComposerModal} >
        <Modal.Header closeButton>
          <Modal.Title>Simple Composer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SimpleComposer />
        </Modal.Body>
      </Modal>

      {/* Teacher Request Modal */}
      <Modal show={showTeacherRequestModal} onHide={handleTeacherRequestModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Request Teacher Access</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTeacherRequestReason">
              <Form.Label>Reason for Request</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter the reason for requesting teacher access"
                value={teacherRequestReason}
                onChange={(e) => setTeacherRequestReason(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleTeacherRequestModalClose}>Close</Button>
          <Button variant="primary" onClick={handleTeacherRequestSubmit}>Submit Request</Button>
        </Modal.Footer>
      </Modal>
    </Navbar>
  );
}