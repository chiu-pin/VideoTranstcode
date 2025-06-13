import React from "react";
import { motion } from "framer-motion";
import "../styles/homepagestyle.css";

const Homapage = () => {
  return (
    <body class="homepage">
      <div class="container w-100">
        <div class="homepagecontainer">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <h1>Hi,This is vedio website</h1>
          <h4>Quickly to click the navbar to login and see your vedio</h4>
          </motion.div>
        </div>
      </div>
    </body>
  );
};

export default Homapage;
