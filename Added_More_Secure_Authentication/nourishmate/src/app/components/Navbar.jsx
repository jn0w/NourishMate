import React, { useEffect, useState } from "react";
import Link from "next/link";
import "../globals.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the token exists and is valid
    const checkLoginStatus = async () => {
      try {
        const res = await fetch("/api/check-auth");
        if (res.ok) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setIsLoggedIn(false);
    // Optionally redirect to homepage or login page
  };

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
          {!isLoggedIn ? (
            <>
              <Link href="/register">
                <button className="navbar__button">Register</button>
              </Link>
              <Link href="/login">
                <button className="navbar__button">Login</button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/account">
                <button className="navbar__button">Account</button>
              </Link>
              <button onClick={handleLogout} className="navbar__button">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
