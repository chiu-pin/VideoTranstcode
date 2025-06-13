import React, { useState } from "react";
import axios from "axios";
import "../styles/aboutstyle.css";
import config from "../config.js";

const UploadPage = ({ token }) => {
  const [file, setFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoType, setVideoType] = useState("");
  const [fileName, setFileName] = useState("No file chosen");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const fileName = selectedFile.name;

    // Check the file extension to determine the file type instead of relying on the MIME type
    const fileExtension = fileName.split(".").pop().toLowerCase();

    if (
      fileExtension === "mp4" ||
      fileExtension === "avi" ||
      fileExtension === "mov"
    ) {
      setFile(selectedFile);
      setFileName(fileName); // Set the selected file name to display

      // Set videoType based on the file extension
      if (fileExtension === "mp4") {
        setVideoType("mp4");
      } else if (fileExtension === "avi") {
        setVideoType("avi");
      } else if (fileExtension === "mov") {
        setVideoType("mov");
      }
    } else {
      alert("Only mp4, avi, and mov formats are allowed");
      e.target.value = null; // Clear the file input
      setFileName("No file chosen");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !videoTitle) {
      alert("Please select a file and enter a title");
      return;
    }

    const formData = new FormData();
    formData.append("video", file); // Append the file as 'video' to match the backend
    formData.append("videoTitle", videoTitle);
    formData.append("videoType", videoType);

    try {
      await axios.post(`${config.baseUrl}/videos/upload-video`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded successfully");
      setFileName("No file chosen"); // Reset the file name after upload
      setFile(null);
      setVideoTitle("");
    } catch (error) {
      alert("Error occurred while uploading the file", error);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Video</h2>
      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="text"
          placeholder="Video Title"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          required
        />
        <div className="file-input-wrapper">
          <button type="button" className="custom-file-button">
            Choose File
          </button>
          <span className="file-name">{fileName}</span>
          <input
            type="file"
            accept=".mp4,.avi,.mov"
            onChange={handleFileChange}
            className="file-input"
            required
          />
        </div>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default UploadPage;
