import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config.js"; 
import "../styles/detailstyle.css"; 

const AdminPage = ({ token }) => {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`${config.baseUrl}/admin/all-videos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
 
        const formattedFiles = response.data.map(file => ({
          videoId: file.videoId.S,
          videoTitle: file.videoTitle.S,
          videoLocation: file.videoLocation.S
        }));

        setFiles(formattedFiles);
      } catch (error) {
        console.error("Error fetching files", error);
      }
    };
    fetchFiles();
  }, [token]);

  const handleDelete = async (videoId) => {
    alert(`${config.baseUrl}/admin/delete-video/${videoId}`);
    try {
      const response = await axios.delete(
        `${config.baseUrl}/admin/delete-video/${videoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(response.data.message);
      

      setFiles(files.filter((file) => file.videoId !== videoId));
    } catch (error) {
      console.error("Error deleting video", error);
      alert("Error deleting video");
    }
  };

  const handleGoHome = () => {
    navigate("/"); 
  };

  const handleCleanTempFiles = async () => {
    alert(token);
    try {
      const response = await axios.delete(
        `${config.baseUrl}/admin/delete-temporary-files`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(response.data.message);
      window.location.href = window.location.href;
    } catch (error) {
      console.error("Error cleaning temporary files", error);
      alert("Error cleaning temporary files");
    }
  };

  return (
    <div className="file-list-container">
      <ul className="file-list">
        {files.length > 0 ? (
          files.map((file) => (
            <li key={file.videoId} className="file-item">
              <div className="file-content">
                <h3>{file.videoTitle}</h3>
                <video
                  controls
                  width="320"
                  height="240"
                  src={file.videoLocation}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDelete(file.videoId)}
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <li>No files found</li>
        )}
      </ul>
      <div className="button-group">
        <button className="go-home-button" onClick={handleGoHome}>
          Go to Home
        </button>
        <button className="clean-temp-button" onClick={handleCleanTempFiles}>
          Clean Temporary Files
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
