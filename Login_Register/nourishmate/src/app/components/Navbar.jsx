// src/app/components/Navbar.js
import React from "react";
import Link from "next/link";
import "../globals.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__container">
        <h1 className="navbar__title">NourishMate</h1>
        <ul className="navbar__list">
          <li className="navbar__item">
            <Link href="/">Home</Link>
          </li>
          <li className="navbar__item">
            <Link href="/about">About</Link>
          </li>
          <li className="navbar__item">
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
        <div className="navbar__buttons">
          <Link href="/register">
            <button className="navbar__button">Register</button>
          </Link>
          <Link href="/login">
            <button className="navbar__button">Login</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
