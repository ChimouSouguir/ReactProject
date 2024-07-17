import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Container, InputGroup, FormControl, Pagination } from 'react-bootstrap';
import { supabase } from '../client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faUserPlus, FaSearch } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useAuth0 } from '@auth0/auth0-react';
import ThemeContext from './ThemeContext';
import LanguageSelector from '../components/LanguageSelector';
import { BsSearch } from 'react-icons/bs'; 
import './AdminDashboard.css';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

import ChartComponent from './ChartComponent';
// Importer l'icône de recherche de react-bootstrap-icons


const AdminDashboard = () => {
  const { theme, toggleTheme, themes } = useContext(ThemeContext);
  const { t } = useTranslation();
  const { user } = useAuth0();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
  });

  const [averageRatingsData, setAverageRatingsData] = useState([]);

  // Local states for data, pagination, and modals
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5); // Number of users per page
  const [songs, setSongs] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [downloadsPerPage] = useState(5); // Number of songs per page
  const [currentDownloadsPage, setCurrentDownloadsPage] = useState(1);
  const [currentDownloads, setCurrentDownloads ] = useState([]);
  const [currentUsersPage, setCurrentUsersPage] = useState(1);


  const [currentSongs, setCurrentSongs] = useState([]);
  const [currentSongsPage, setCurrentSongsPage] = useState(1);
  const [songsPerPage] = useState(5); // Number of songs per page
  const [currentComments, setCurrentComments] = useState([]);
  const [comments, setComments] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentCommentsPage, setCurrentCommentsPage] = useState(1);
  const [commentsPerPage] = useState(5); // Number of comments per page
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSongModal, setShowSongModal] = useState(false);
  const [ShowRequestModal, setShowRequestModal] = useState(false);

  const [selectedSong, setSelectedSong] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [downloadCounts, setDownloadCounts] = useState([]);
  const [currentRequests, setCurrentRequests] = useState([]);
  const [currentRequestsPage, setCurrentRequestsPage] = useState(1);
  const [requestsPerPage] = useState(5);
  const [selectedRequest, setSelectedRequest] = useState(null);


  // useEffect to fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchSongs();
    fetchComments();
    fetchRequests();
    fetchDownloadCounts();
  }, [currentPage, currentSongsPage, currentCommentsPage, currentDownloadsPage,currentRequestsPage]);

  // Fonction pour gérer l'ouverture et la fermeture du formulaire d'ajout
  const handleShowAddUserModal = () => setShowAddUserModal(true);
  const handleCloseAddUserModal = () => setShowAddUserModal(false);

  // Fonction pour gérer les changements dans le formulaire d'ajout
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };
  // Function to fetch average ratings from Supabase
  const fetchAverageRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('song_average_ratings')
        .select('song_title, average_rating');
  
      if (error) throw error;
  
      setAverageRatingsData(data); // Update average ratings data state
    } catch (error) {
      console.error('Error fetching average ratings:', error.message);
    }
  };
useEffect(() => {
  fetchAverageRatings();
}, []);
const chartData = {
  labels: averageRatingsData.map(item => item.song_title),
  datasets: [
    {
      label: 'Average Rating',
      data: averageRatingsData.map(item => item.average_rating),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
  ],
};

  // Fonction pour soumettre le formulaire d'ajout d'utilisateur
  const handleSubmitAddUser = async (e) => {
    e.preventDefault();
    try {
      const { name, email, role } = newUser;

      const { data, error } = await supabase.from('users').insert({
        name: name,
        email: email,
        role: role,
        warnings: null,
      });

      if (error) throw error;
      console.log('User added successfully:', data);
      fetchUsers(); // Rafraîchir la liste des utilisateurs après l'ajout
      handleCloseAddUserModal(); // Fermer le modal après l'ajout
    } catch (error) {
      console.error('Error adding user:', error.message);
    }
  };
  // Handle search input change
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  



  // Functions to fetch data from Supabase
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .range((currentPage - 1) * usersPerPage, currentPage * usersPerPage - 1);

      if (error) throw error;
      setUsers(data);
      setFilteredUsers(data);

    } catch (error) {
      console.error('Error fetching users:', error.message);
    }
  };
  const fetchDownloadCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('downloads')
        .select('title, COUNT(*) AS download_count')
        .group('title');
  
      if (error) {
        throw error;
      }
  
      return data;
    } catch (error) {
      console.error('Error fetching download counts:', error.message);
      return [];
    }
  };
  useEffect(() => {
    fetchDownloadCounts().then(data => {
      setDownloadCounts(data);
    });
  }, []);
  
  
  // Functions to fetch data from Supabase
  // Count downloads by title
 
  
  const fetchSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .range((currentSongsPage - 1) * songsPerPage, currentSongsPage * songsPerPage - 1);

      if (error) throw error;
      setCurrentSongs(data);
    } catch (error) {
      console.error('Error fetching songs:', error.message);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .range((currentCommentsPage - 1) * commentsPerPage, currentCommentsPage * commentsPerPage - 1);

      if (error) throw error;
      setCurrentComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error.message);
    }
  };

  // Functions to handle actions (delete, approve, edit)
  const handleDeleteUser = async (userId) => {
    setItemToDelete({ id: userId, type: 'user' });
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (itemToDelete && itemToDelete.type === 'user') {
      try {
        const { error } = await supabase.from('users').delete().eq('id', itemToDelete.id);

        if (error) throw error;
        fetchUsers(); // Refresh user list after deletion
        setShowDeleteConfirmation(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Error deleting user:', error.message);
      }
    }
  };

  const handleDeleteSong = async (songId) => {
    setItemToDelete({ id: songId, type: 'song' });
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDeleteSong = async () => {
    if (itemToDelete && itemToDelete.type === 'song') {
      try {
        const { error } = await supabase.from('songs').delete().eq('id_song', itemToDelete.id);

        if (error) throw error;
        fetchSongs(); // Refresh song list after deletion
        setShowDeleteConfirmation(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Error deleting song:', error.message);
      }
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };



  const handleApproveComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ approved: true })
        .eq('id', commentId);

      if (error) throw error;
      fetchComments(); // Refresh comment list after approval
    } catch (error) {
      console.error('Error approving comment:', error.message);
    }
  };

  const handleShowUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleShowSongModal = (song) => {
    setSelectedSong(song);
    setShowSongModal(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  const handleCloseSongModal = () => {
    setSelectedSong(null);
    setShowSongModal(false);
  };

  const handleUpdateUserProfile = async (event) => {
    event.preventDefault();
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
          warnings:selectedUser.warnings,
        })
        .eq('id', selectedUser.id);

      if (error) throw error;
      fetchUsers(); // Refresh user list after update
      handleCloseUserModal();
    } catch (error) {
      console.error('Error updating user profile:', error.message);
    }
  };

  const handleUpdateSong = async (event) => {
    event.preventDefault();
    try {
      const { error } = await supabase
        .from('songs')
        .update({
          title: selectedSong.title,
          name: selectedSong.name,
        })
        .eq('id_song', selectedSong.id_song);

      if (error) throw error;
      fetchSongs(); // Refresh song list after update
      handleCloseSongModal();
    } catch (error) {
      console.error('Error updating song:', error.message);
    }
  };
  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_requests')
        .select('*')
        .range((currentRequestsPage - 1) * requestsPerPage, currentRequestsPage * requestsPerPage - 1);

      if (error) throw error;

      setCurrentRequests(data);
    } catch (error) {
      console.error('Error fetching teacher requests:', error.message);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    setItemToDelete({ id: requestId, type: 'request' });
    setShowDeleteConfirmation(true);
  };


  const handleConfirmDeleteRequest = async () => {
    if (itemToDelete && itemToDelete.type === 'request') {
      try {
        const { error } = await supabase.from('teacher_requests').delete().eq('id', itemToDelete.id);

        if (error) throw error;

        fetchRequests(); // Refresh request list after deletion
        setShowDeleteConfirmation(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Error deleting request:', error.message);
      }
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('teacher_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;

      fetchRequests(); // Refresh request list after approval
    } catch (error) {
      console.error('Error approving request:', error.message);
    }
  };

  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };


  const handleShowRequestModal = (request) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };
  const handleApproveRequestAndUserRole = async (requestId) => {
    try {
      // Approve request
      const { error: requestError } = await supabase
        .from('teacher_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
  
      if (requestError) throw requestError;
  
      // Update user role
      const request = currentRequests.find(req => req.id === requestId);
      if (request) {
        const { email } = request;
        const { error: roleError } = await supabase
          .from('users')
          .update({ role: 'teacher' })
          .eq('email', email);
  
        if (roleError) throw roleError;
  
        fetchRequests(); // Refresh request list after approval
        fetchUsers(); // Refresh user list after role update
      }
    } catch (error) {
      console.error('Error handling request and user role update:', error.message);
    }
  };
  
 
  
  

  const handleCloseRequestModal = () => {
    setSelectedRequest(null);
    setShowRequestModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };

  const handlePrevRequestsPage = () => setCurrentRequestsPage((prevPage) => Math.max(prevPage - 1, 1));
  const handleNextRequestsPage = () => setCurrentRequestsPage((prevPage) => prevPage + 1);
  const totalPagesRequests = Math.ceil(currentRequests.length / requestsPerPage);

  const paginateRequests = (pageNumber) => setCurrentRequestsPage(pageNumber);

  // Pagination for users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const handlePrevUsersPage = () => setCurrentUsersPage((prevPage) => Math.max(prevPage - 1, 1));
  const handleNextUsersPage = () => setCurrentUsersPage((prevPage) => prevPage + 1);
  const totalPagesUsers = Math.ceil(currentUsers.length / usersPerPage);
  // Pagination for songs
  const handlePrevSongsPage = () => setCurrentSongsPage((prevPage) => Math.max(prevPage - 1, 1));
  const handleNextSongsPage = () => setCurrentSongsPage((prevPage) => prevPage + 1);
  const totalPagesSongs = Math.ceil(currentSongs.length / songsPerPage);
 //for downloads
  // Pagination for downloads
  const handlePrevDownloadsPage = () => setCurrentDownloadsPage((prevPage) => Math.max(prevPage - 1, 1));
  const handleNextDownloadsPage = () => setCurrentDownloadsPage((prevPage) => prevPage + 1);
  const totalPagesDownloads = Math.ceil(currentDownloads.length / downloadsPerPage);




  // Pagination for comments
  const handlePrevCommentsPage = () => setCurrentCommentsPage((prevPage) => Math.max(prevPage - 1, 1));
  const handleNextCommentsPage = () => setCurrentCommentsPage((prevPage) => prevPage + 1);
  const totalPagesComments = Math.ceil(comments.length / commentsPerPage);

  // Render comment items
  const indexOfLastComment = currentCommentsPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentCommentsList = comments.slice(indexOfFirstComment, indexOfLastComment);
  const currentTheme = themes[theme];
  if (!currentTheme) {
    return <div>Error: Theme not found</div>;
  }
  // Dynamic styling based on selected theme
  const dashboardStyle = {
    background: currentTheme.background,
    color: currentTheme.color,
    minHeight: '100vh',
  };

  return (
    <Container className="admin-dashboard" style={dashboardStyle}>
    <Container className="admin-dashboard text-center pt-4">
      <h1 className="mb-4">🎶{t('admin_dashboard')} 🎧🎤🎷🥁🎸🎺</h1>
 
    </Container>
    <LanguageSelector />
       {/* Chart Section */}
       <ChartComponent averageRatingsData={averageRatingsData} />
      <Button variant="secondary" onClick={toggleTheme} className="mb-3">
        {t('toggle_theme')} ({theme === 'light' ? 'Dark' : 'Light'})
      </Button>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">
        <InputGroup className="mb-2">
      <InputGroup.Prepend>
        <InputGroup.Text className="search-icon">
          <BsSearch />
        </InputGroup.Text>
      </InputGroup.Prepend>
      <FormControl
        placeholder={t('Search users')}
        onChange={handleSearch}
      />
    </InputGroup>

        </div>
        <div>
          

        </div>
      </div>




      {/* Formulaire modal pour ajouter un nouvel utilisateur */}
      <Modal show={showAddUserModal} onHide={handleCloseAddUserModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('add_user')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitAddUser}>
            <Form.Group controlId="formAddUsername">
              <Form.Label>{t('username')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('enter_username')}
                name="name" // Utilisation de "name" pour correspondre au champ dans la table
                value={newUser.name}
                onChange={handleChange}
                required
              />

            </Form.Group>
            <Form.Group controlId="formAddEmail">
              <Form.Label>{t('email')}</Form.Label>
              <Form.Control
                type="email"
                placeholder={t('enter_email')}
                name="email"
                value={newUser.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formAddRole">
              <Form.Label>{t('role')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('enter_role')}
                name="role"
                value={newUser.role}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {t('add')}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>


      {/* Utilisateurs Table */}
      <div className="mb-4">
        <h3>{t('users')}</h3>
        <Table striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
          <thead>
            <tr>
              <th>{t('id')}</th>
              <th>{t('name')}</th>
              <th>{t('email')}</th>
              <th>{t('role')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <Button variant="info" onClick={() => handleShowUserModal(user)} className="me-2">
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteUser(user.id)} className="me-2">
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </Button>
                  <Button variant="success" onClick={handleShowAddUserModal} className="me-2">
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                    {t('add_user')}
                  </Button>


                </td>
              </tr>
            ))}
          </tbody>
        </Table>

      </div>
      {/* Pagination for Downloads */}
  <Pagination className="justify-content-center">
    <Pagination.Prev onClick={handlePrevUsersPage} />
    {Array.from({ length: totalPagesUsers }, (_, index) => (
      <Pagination.Item key={index + 1} active={index + 1 === currentUsersPage} onClick={() => setCurrentUsersPage(index + 1)}>
        {index + 1}
      </Pagination.Item>
    ))}
    <Pagination.Next onClick={handleNextUsersPage} />
  </Pagination>

      {/* Songs Table */}
      <div className="mb-4">
        <h3>{t('songs')}</h3>
        <Table striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
          <thead>
            <tr>
              <th>{t('id')}</th>
              <th>{t('title')}</th>
              <th>{t('artist')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {currentSongs.map((song) => (
              <tr key={song.id_song}>
                <td>{song.id_song}</td>
                <td>{song.title}</td>
                <td>{song.name}</td>
                <td>
                  <Button variant="info" onClick={() => handleShowSongModal(song)} className="me-2">
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteSong(song.id_song)}>
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {/* Pagination for Songs */}
      <Pagination className="justify-content-center">
        <Pagination.Prev onClick={handlePrevSongsPage} />
        {Array.from({ length: totalPagesSongs }, (_, index) => (
          <Pagination.Item key={index + 1} active={index + 1 === currentSongsPage} onClick={() => setCurrentSongsPage(index + 1)}>
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={handleNextSongsPage} />
      </Pagination>


      <div className="admin-section">
        <h2>{t('Requests Management')}</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>{t('Email')}</th>
              <th>{t('Status')}</th>
              <th>{t('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.map((request, index) => (
              <tr key={request.id}>
                <td>{index + 1}</td>
                <td>{request.email}</td>
                <td>{request.status}</td>
                <td>
                  <Button variant="outline-success" size="sm" onClick={() => handleApproveRequestAndUserRole(request.id)}>
                    {t('Approve')}
                  </Button>{' '}
                   </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pagination className="justify-content-center">
        <Pagination.Prev onClick={handlePrevRequestsPage} />
        {Array.from({ length: totalPagesRequests }, (_, index) => (
          <Pagination.Item key={index + 1} active={index + 1 === currentRequestsPage} onClick={() => setCurrentRequestsPage(index + 1)}>
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={handleNextRequestsPage} />
      </Pagination>
      </div>

        {/* Comments Table */}
      <div className="mb-4">
        <h3>{t('comments')}</h3>
        <Table striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
          <thead>
            <tr>
              <th>{t('id')}</th>
              <th>{t('comment')}</th>
              <th>{t('user')}</th>
              <th>{t('approved')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {currentComments.map((comment) => (
              <tr key={comment.id}>
                <td>{comment.id}</td>
                <td>{comment.comment}</td>
                <td>{comment.user_name}</td>
                <td>{comment.approved ? t('yes') : t('Pending')}</td>
                <td>
                  {!comment.approved && (
                    <Button
                      variant="success"
                      onClick={() => handleApproveComment(comment.id)}
                      className="me-2"
                    >
                      {t('approve')}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Pagination for Comments */}
        <Pagination className="justify-content-center">
          <Pagination.Prev onClick={handlePrevCommentsPage} />
          {Array.from({ length: totalPagesComments }, (_, index) => (
            <Pagination.Item key={index + 1} active={index + 1 === currentCommentsPage} onClick={() => setCurrentCommentsPage(index + 1)}>
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={handleNextCommentsPage} />
        </Pagination>
        

 {/* Downloads Table */}
 

      </div>

      {/* Modals */}
      {/* User Modal */}
      <Modal show={showUserModal} onHide={handleCloseUserModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('edit_user')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateUserProfile}>
            <Form.Group controlId="formUserName">
              <Form.Label>{t('name')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('enter_name')}
                value={selectedUser?.name || ''}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, name: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group controlId="formUserEmail">
              <Form.Label>{t('email')}</Form.Label>
              <Form.Control
                type="email"
                placeholder={t('enter_email')}
                value={selectedUser?.email || ''}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group controlId="formUserRole">
              <Form.Label>{t('role')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('enter_role')}
                value={selectedUser?.role || ''}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {t('update')}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Song Modal */}
      <Modal show={showSongModal} onHide={handleCloseSongModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('edit_song')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateSong}>
            <Form.Group controlId="formSongTitle">
              <Form.Label>{t('title')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('enter_title')}
                value={selectedSong?.title || ''}
                onChange={(e) =>
                  setSelectedSong({ ...selectedSong, title: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group controlId="formSongArtist">
              <Form.Label>{t('artist')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('enter_artist')}
                value={selectedSong?.name || ''}
                onChange={(e) =>
                  setSelectedSong({ ...selectedSong, name: e.target.value })
                }
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {t('update')}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      


      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirmation} onHide={handleCancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>{t('confirm_deletion')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {itemToDelete?.type === 'user' && (
            <p>{t('confirm_delete_user')}</p>
          )}
          {itemToDelete?.type === 'song' && (
            <p>{t('confirm_delete_song')}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>
            {t('cancel')}
          </Button>
          <Button variant="danger" onClick={itemToDelete?.type === 'user' ? handleConfirmDeleteUser : handleConfirmDeleteSong}>
            {t('delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;

