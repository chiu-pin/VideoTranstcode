import React, { useState, useEffect } from "react";
import axios from 'axios';
import config from "../config.js";  
import "../styles/detailstyle.css";

const FileListPage = ({ token }) => {
    const [files, setFiles] = useState([]);
    const [showFullLocations, setShowFullLocations] = useState({});

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get(`${config.baseUrl}/videos/my-videos`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
    
                // Map and extract the required attributes
                const formattedFiles = response.data.map(file => ({
                    videoId: file.videoId.S, // Confirm these correspond to DynamoDB attributes
                    videoTitle: file.videoTitle.S,
                    videoLocation: file.videoLocation, // Ensure this is the presigned URL
                    videoType: file.videoType.S
                }));
                setFiles(formattedFiles); // Set the file list
                
            } catch (error) {
                alert('Error fetching files: ' + error.message); // Display error message
            }
        };
        fetchFiles();
    }, [token]);

    // Handle showing/hiding videoLocation
    const handleToggleLocation = (videoId) => {
        setShowFullLocations(prevState => ({
            ...prevState,
            [videoId]: !prevState[videoId] // Toggle show/hide state
        }));
    };

    const handleDelete = async (videoId) => {
        alert(`${config.baseUrl}/videos/delete-video/${videoId}`);
        try {
            const response = await axios.delete(`${config.baseUrl}/videos/delete-video/${videoId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(response.data.message);
            setFiles(files.filter(file => file.videoId !== videoId));
        } catch (error) {
            console.error('Error deleting video', error);
            alert('Error deleting video');
        }
    };

    return (
        <div className="file-list-container">
            <ul className="file-list">
                {files.length > 0 ? (
                    files.map(file => (
                        <li key={file.videoId} className="file-item">
                            <div className="file-content">
                                <h3>{file.videoTitle}</h3>

                                {file.videoType === 'mp4' || file.videoType === 'mov' ? (
                                    <video
                                        controls
                                        width="320"
                                        height="240"
                                        src={file.videoLocation} // Use the correct presigned URL
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <p>Cannot preview this video format. Please download it.</p>
                                )}

                                {/* Button to show/hide videoLocation */}
                                <button 
                                    onClick={() => handleToggleLocation(file.videoId)}
                                >
                                    {showFullLocations[file.videoId] ? 'Hide URL' : 'Show URL'}
                                </button>

                                {/* Display videoLocation based on state */}
                                {showFullLocations[file.videoId] && (
                                    <p>{file.videoLocation}</p>
                                )}
                            </div>
                            <button className="delete-button" onClick={() => handleDelete(file.videoId)}>Delete</button>
                        </li>
                    ))
                ) : (
                    <li>No files found</li>
                )}
            </ul>
        </div>
    );
};

export default FileListPage;