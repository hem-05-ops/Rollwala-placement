import React from "react";
import "./about.css";
import gulogo from "../assets/gulogo2.png";

function About() {
  return (
    <div className="about-bg">
      <div className="about-container">
        <div className="about-header">
          <img
            src={gulogo}
            alt="Gujarat University Logo"
            className="about-logo"
          />
          <h1>About Us</h1>
        </div>
        <div className="about-content">
          <h2>Department of Computer Science, GU Ahmedabad</h2>
          <p>
            <strong>DCS at GU Ahmedabad</strong> is dedicated to empowering students with the skills, guidance, and opportunities needed for successful careers. Our Campus Recruitment Portal is a specialized platform designed for the DCS department to streamline campus placements.
          </p>
          <ul>
            <li>Personalized student profile management and career tracking</li>
            <li>Centralized job postings and application management</li>
            <li>Automated interview and test scheduling</li>
            <li>Real-time analytics and placement insights</li>
            <li>Dedicated DCS trainers and placement support team</li>
            <li>Strong industry connections and recruiter engagement</li>
          </ul>
          <p>
            At DCS, GU Ahmedabad, we are committed to nurturing talent, fostering industry partnerships, and ensuring every student is prepared for the professional world.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;