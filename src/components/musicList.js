import React, { useState, useEffect } from 'react';
import { supabase } from '../client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Import CSS file
import Music from './music';
import moment from 'moment';
import './welcome.css'; // Custom CSS for styling
import { useAuth0 } from '@auth0/auth0-react';
import happy from './Sounds/happy.mp3';

export default function MusicList() {
  const { isAuthenticated } = useAuth0();
  const [musicList, setMusicList] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showWelcome, setShowWelcome] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false); // Track if sound has been played

  useEffect(() => {
    if (isAuthenticated) {
      setShowWelcome(true);
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, musicList]);

  async function fetchSongs() {
    try {
      const { data, error } = await supabase.from('songs').select('*');
      if (error) throw error;
      setMusicList(data);
    } catch (error) {
      console.error('Error fetching songs:', error.message);
    }
  }

  const playSound = () => {
    if (!soundPlayed) {
      const audio = new Audio(happy);
      audio.play();
      setSoundPlayed(true);
    }
  };

  const WelcomeMessage = () => (
    <div className="welcome-message fade-in">
      <h2>🎉 Bienvenue dans Composia ! 🎉</h2>
      <p>Nous sommes ravis de vous voir ici.</p>
      <button className="btn btn-primary" onClick={playSound}>
        Click to Celebrate!
      </button>
    </div>
  );

  function applyFilters() {
    let filtered = musicList;

    if (filter === 'today') {
      filtered = musicList.filter((song) =>
        moment(song.created_at).isSame(moment(), 'day')
      );
    } else if (filter === 'week') {
      const weekStart = moment().startOf('isoWeek');
      filtered = musicList.filter((song) =>
        moment(song.created_at).isSameOrAfter(weekStart)
      );
    } else if (filter === 'month') {
      const monthStart = moment().startOf('month');
      filtered = musicList.filter((song) =>
        moment(song.created_at).isSameOrAfter(monthStart)
      );
    } else if (filter !== 'all') {
      filtered = musicList.filter((song) => song.genre === filter);
    }

    setFilteredSongs(filtered);
  }

  const handleRadioChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div className="music-section">
      {showWelcome && <WelcomeMessage />}
      <div className="container py-5">
        {/* Filters for genre */}
        <div className="filters">
          <div className="genre-filters btn-group mb-4" role="group">
            {['all', 'Rock', 'Pop', 'Jazz', 'Classical'].map((genre) => (
              <React.Fragment key={genre}>
                <input
                  type="radio"
                  className="btn-check"
                  name="filter"
                  id={genre}
                  value={genre}
                  checked={filter === genre}
                  onChange={handleRadioChange}
                />
                <label className="btn btn-outline-dark" htmlFor={genre}>
                  {genre === 'all' ? 'All Songs' : genre}
                </label>
              </React.Fragment>
            ))}
          </div>

          {/* Filters for upload dates */}
          <div className="date-filters btn-group mb-4" role="group">
            {['today', 'week', 'month'].map((timeframe) => (
              <React.Fragment key={timeframe}>
                <input
                  type="radio"
                  className="btn-check"
                  name="filter"
                  id={timeframe}
                  value={timeframe}
                  checked={filter === timeframe}
                  onChange={handleRadioChange}
                />
                <label className="btn btn-outline-dark" htmlFor={timeframe}>
                  {`Uploaded ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}`}
                </label>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Render music cards based on filtered songs */}
        <div className="row">
          {filteredSongs.length ? (
            filteredSongs.map((music, index) => <Music key={index} music={music} />)
          ) : (
            <h1 className="no-music text-center">No Music Found!</h1>
          )}
        </div>
      </div>
    </div>
  );
}
