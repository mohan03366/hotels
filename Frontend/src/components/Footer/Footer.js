import React from "react";
import "./Footer.css";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

function Footer() {
  return (
    <div className="footer p-5">
      <div className="footer-content container">
        <h3 className="footer-title">Hotel Royal Blue Star</h3>
        <p className="footer-text">
          Near SKMCH Overbridge, In front of Petrol Pump, Muzaffarpur - 842001
        </p>

        <p className="footer-text">
          <strong>Owner:</strong> Jitendar Jii <br />
          <strong>Contact:</strong> <a href="tel:9031370046">9031370046</a>{" "}
          <br />
          <strong>Email:</strong>{" "}
          <a href="mailto:hotelroyalbluestar@gmail.com">
            hotelroyalbluestar@gmail.com
          </a>
        </p>

        <div className="social-links">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <FaFacebook />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <FaInstagram />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <FaTwitter />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            <FaLinkedin />
          </a>
        </div>

        <p className="footer-credit">
          Developed by <strong>Scalably Vision Pvt Ltd</strong> <br />
          &copy; {new Date().getFullYear()} All rights reserved by Scalably
          Vision
        </p>
      </div>
    </div>
  );
}

export default Footer;
