import React, { useState, useEffect } from "react";
import { supabase } from "../client";
import ReactAudioPlayer from "react-audio-player";
import { Card, Row, Col } from "react-bootstrap";
import moment from "moment";
import "./DownloadedSongsPage.css";
import image from "./images/image.png"; 

export default function DownloadedSongsPage() {
  const [downloadedSongs, setDownloadedSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchDownloadedSongs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, downloadedSongs]);

  const fetchDownloadedSongs = async () => {
    try {
      const { data, error } = await supabase
        .from("download_songs")  // Fetch from the view instead of the table
        .select("*")
        .order("downloaded_at", { ascending: false }); // Order by downloaded_at in descending order

      if (error) {
        throw error;
      }

      console.log("Fetched data:", data); // Log the fetched data to check structure
      setDownloadedSongs(data);
    } catch (error) {
      console.error("Error fetching downloaded songs:", error.message);
    }
  };

  const applyFilters = () => {
    const today = moment().startOf('day');
    const weekStart = moment().startOf('isoWeek');
    const monthStart = moment().startOf('month');

    let filtered = downloadedSongs;

    if (filter === "today") {
      filtered = downloadedSongs.filter(song => moment(song.downloaded_at).isSame(today, 'day'));
    } else if (filter === "week") {
      filtered = downloadedSongs.filter(song => moment(song.downloaded_at).isSameOrAfter(weekStart));
    } else if (filter === "month") {
      filtered = downloadedSongs.filter(song => moment(song.downloaded_at).isSameOrAfter(monthStart));
    }

    console.log("Filtered data:", filtered); // Log the filtered data to check the result
    setFilteredSongs(filtered);
  };

  const handleRadioChange = (e) => {
    setFilter(e.target.value);
  };

  const handleDownload = (url, title) => {
    try {
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const href = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = href;
          link.download = title;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
    } catch (error) {
      console.error("Error downloading file: ", error.message);
    }
  };

  const renderNoMusicMessage = () => {
    if (filter === "today") {
      return "No music downloaded today.";
    } else if (filter === "week") {
      return "No music downloaded this week.";
    } else if (filter === "month") {
      return "No music downloaded this month.";
    } else {
      return "No music found.";
    }
  };

  return (
    <div className="full-page-container" style={{ backgroundImage: `url(${image})` }}>
      <div className="downloaded-songs-container">
      <h1 className="mb-4">🎶 Downloaded Songs 🎶</h1>
        <div className="filters btn-group mb-4" role="group">
          <input
            type="radio"
            className="btn-check"
            name="filter"
            id="all"
            value="all"
            checked={filter === "all"}
            onChange={handleRadioChange}
          />
          <label className="btn btn-outline-primary" htmlFor="all">All Downloads</label>

          <input
            type="radio"
            className="btn-check"
            name="filter"
            id="today"
            value="today"
            checked={filter === "today"}
            onChange={handleRadioChange}
          />
          <label className="btn btn-outline-primary" htmlFor="today">Downloaded Today</label>

          <input
            type="radio"
            className="btn-check"
            name="filter"
            id="week"
            value="week"
            checked={filter === "week"}
            onChange={handleRadioChange}
          />
          <label className="btn btn-outline-primary" htmlFor="week">Downloaded This Week</label>

          <input
            type="radio"
            className="btn-check"
            name="filter"
            id="month"
            value="month"
            checked={filter === "month"}
            onChange={handleRadioChange}
          />
          <label className="btn btn-outline-primary" htmlFor="month">Downloaded This Month</label>
        </div>
        {filteredSongs.length ? (
          <Row>
            {filteredSongs.map((song, index) => (
              <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <Card className="custom-card">
                  <Card.Body>
                    <Card.Title>{song.title}</Card.Title>
                    <Card.Text>
                      <span className="song-info">Uploader:</span> {song.song_name ? song.song_name : "Unknown"}<br />
                      <span className="song-info">Downloader:</span> {song.name}<br />
                      <span className="song-info">Downloaded At:</span>{" "}
                      {moment(song.downloaded_at).format("YYYY-MM-DD HH:mm:ss")}
                    </Card.Text>

                    <ReactAudioPlayer src={song.url} controls className="audio-player mb-3" />
                    
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="no-music-message">
            <h2>{renderNoMusicMessage()}</h2>
          </div>
        )}
      </div>
    </div>
  );
}
