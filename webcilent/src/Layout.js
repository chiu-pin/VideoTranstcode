import { NavLink, Outlet } from "react-router-dom";
import React from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { Helmet } from "react-helmet";

const Layout = () => {
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>PinChieh</title>
        <meta name="description" content="PinChieh" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"
          integrity="sha384-xOolHFLEh07PJGoPkLv1IbcEPTNtaed2xpHsD9ESMhqIYd0nLMwNLD69Npy4HI+N"
          crossOrigin="anonymous"
        />
      </Helmet>
      <Header />
      <nav>
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
              Homepage
            </NavLink>
          </li>
          <li>
            <NavLink to="/filelist" className={({ isActive }) => (isActive ? "active" : "")}>
              File List
            </NavLink>
          </li>
          <li>
            <NavLink to="/uploadpage" className={({ isActive }) => (isActive ? "active" : "")}>
              Upload Page
            </NavLink>
          </li>
          <li>
            <NavLink to="/transcode" className={({ isActive }) => (isActive ? "active" : "")}>
              Transcode
            </NavLink>
          </li>
          <li>
            <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
              Login
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
