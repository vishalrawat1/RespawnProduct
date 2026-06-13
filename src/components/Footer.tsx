"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer style={{ marginTop: "40px" }}>
      {/* Back to Top */}
      <div className="footer-back" onClick={scrollToTop}>
        Back to top
      </div>

      {/* Footer Links */}
      <div className="footer-links">
        <div className="footer-column">
          <h4>Get to Know Us</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Press Releases</a></li>
            <li><a href="#">Respawn Science</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Connect with Us</h4>
          <ul>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">Instagram</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Make Money with Us</h4>
          <ul>
            <li><a href="#">Sell on Respawn</a></li>
            <li><a href="#">Protect and Build Your Brand</a></li>
            <li><a href="#">Become an Affiliate</a></li>
            <li><a href="#">Fulfillment by Respawn</a></li>
            <li><a href="#">Advertise Your Products</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Let Us Help You</h4>
          <ul>
            <li><a href="#">COVID-19 and Respawn</a></li>
            <li><a href="#">Your Account</a></li>
            <li><a href="#">Returns Centre</a></li>
            <li><a href="#">100% Purchase Protection</a></li>
            <li><a href="#">Respawn App Download</a></li>
            <li><a href="#">Help</a></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "15px", flexWrap: "wrap" }}>
          <span>Australia</span>
          <span>Brazil</span>
          <span>Canada</span>
          <span>France</span>
          <span>Germany</span>
          <span>Italy</span>
          <span>Japan</span>
          <span>Mexico</span>
          <span>United Kingdom</span>
          <span>United States</span>
        </div>
        <p>© 2026, RespawnProduct, Inc. or its affiliates. Built for Vishal Rawat.</p>
      </div>
    </footer>
  );
}
