import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { ThemeProvider } from './components/ThemeContext';
import Loading from './components/loading';
import MusicList from './components/musicList';
import Header from './components/header';
import Downloads from './components/downloads';
import MySongs from './components/MySongs';
import MyDownloads from './components/MyDownloads';
import Forums from './components/Forums';
import AdminDashboard from './components/AdminDashboard';
import AdvancedMusicNoteGame from './components/AdvancedMusicNoteGame';
import MemoryGame from './components/MemoryGame';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import i18n from './i18n/i18n';
import SimpleComposer from './components/SimpleComposer';
import LessonManagement from './components/LessonManagement';
import TeacherLessons from './components/TeacherLessons';
import MyLessons from './components/MyLessons';



const App = () => {
  const { isAuthenticated, user, isLoading } = useAuth0();
  console.log('Current language:', i18n.language);

  return (
    <ThemeProvider>
      <HelmetProvider>
        <div className="container mt-5 mb-3">
          <Helmet>
            <meta charSet="utf-8" />
            <script
              src="https://upload-widget.cloudinary.com/global/all.js"
              type="text/javascript"
            ></script>
          </Helmet>
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<MusicList />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/MyDownloads" element={<MyDownloads />} />
              <Route path="/MySongs" element={<MySongs />} />
              <Route path="/forums" element={<Forums />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/play-game" element={<AdvancedMusicNoteGame />} />
              <Route path="/play-memory-game" element={<MemoryGame />} />
              <Route path="/play-composer-game" element={<SimpleComposer />} />
              <Route path="/lesson-management" element={<LessonManagement />} /> 
              <Route path="/Teacher-Lessons" element={<TeacherLessons />} />
              <Route path="/MyLessons" element={<MyLessons />} />


            </Routes>
          </Router>
        </div>
      </HelmetProvider>
    </ThemeProvider>
  );
};

export default App;
