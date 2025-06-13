import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import FileListPage from './pages/FileListPage';
import UploadPage from './pages/UploadPage';
import TranscodePage from './pages/TranscodePage';
import AdminPage from './pages/AdminPage';  
import SignUpPage from './pages/SignUpPage'; 
import "./styles/style.css";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const handleBeforeUnload = () => {
      setToken(null);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const RequireAuth = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          <Route path="filelist" element={<RequireAuth><FileListPage token={token} /></RequireAuth>} />
          <Route path="/signup" element={<SignUpPage />} />  {/*  SignUpPage route */}
          <Route path="uploadpage" element={<RequireAuth><UploadPage token={token}/></RequireAuth>} />
          <Route path="transcode" element={<RequireAuth><TranscodePage token={token} /></RequireAuth>} />
          <Route path="login" element={<LoginPage setToken={setToken} />} />
          <Route path="admin" element={<RequireAuth><AdminPage token={token} /></RequireAuth>} /> {/* new admin page */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
