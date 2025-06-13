import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/transcodepage.css";
import config from '../config.js';  

const TranscodePage = ({ token }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [statusMessage, setStatusMessage] = useState(''); // Status message

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`${config.baseUrl}/videos/my-videos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        

        const formattedFiles = response.data.map(file => ({
          _id: file.videoId.S,  
          videoTitle: file.videoTitle.S, 
          videoLocation: file.videoLocation.S,  
          videoType: file.videoType.S 
        }));
        
        setFiles(formattedFiles);
      } catch (error) {
        console.error('Error fetching files', error);
      }
    };
    fetchFiles();
  }, [token]);

  const handleTranscode = async () => {
    if (!selectedFile || !targetFormat) {
      alert('Please select a file and target format.');
      return;
    }

    setLoading(true); // Start loading
    setStatusMessage('Transcoding in progress...'); // Set waiting message

    try {
      const response = await axios.post(`${config.baseUrl}/videos/transcode`, {
        videoId: selectedFile._id,  
        targetFormat: targetFormat
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { downloadUrl } = response.data;
      
      // Automatically download the transcoded video file
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', selectedFile.videoTitle + '.' + targetFormat); // Customize download file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatusMessage('Transcoding completed!'); // Update message after transcoding

      // Reset selected file and format
      setSelectedFile(null);
      setTargetFormat('');
      
    } catch (error) {
      console.error('Error starting transcoding', error);
      setStatusMessage('Transcoding failed. Please try again.'); // Transcoding failure message
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="transcode-container">
      <h2>Transcode Video</h2>
      
      <label>Select Video:</label>
      <select 
        value={selectedFile ? selectedFile._id : ''} // Keep the selection box value
        onChange={(e) => {
          const file = files.find(f => f._id === e.target.value);
          setSelectedFile(file);
        }}
      >
        <option value="">-- Select a Video --</option>
        {files.map(file => (
          <option key={file._id} value={file._id}>
            {file.videoTitle}
          </option>
        ))}
      </select>

      {selectedFile && (
        <>
          <p>Current Format: {selectedFile.videoType}</p>
          <p>videoId: {selectedFile._id}</p>

          <label>Target Format:</label>
          <select 
            value={targetFormat} 
            onChange={(e) => setTargetFormat(e.target.value)}
          >
            <option value="">-- Select Target Format --</option>
            <option value="mp4">MP4</option>
            <option value="avi">AVI</option>
            <option value="mov">MOV</option>
          </select>
        </>
      )}

      <button onClick={handleTranscode} disabled={loading}>
        {loading ? 'Transcoding...' : 'Start Transcoding'}
      </button>

      {statusMessage && <p>{statusMessage}</p>} {/* Display transcoding status message */}
    </div>
  );
};

export default TranscodePage;
