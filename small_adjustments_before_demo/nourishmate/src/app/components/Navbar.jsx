import React, { useEffect, useState } from "react"; // Import React and necessary hooks
import Link from "next/link"; // Import Next.js's Link component for navigation
import "../globals.css"; // Import global CSS styles

function Navbar() {
  // State variables to track login and admin status.
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Tracks if the user is logged in.
  const [isAdmin, setIsAdmin] = useState(false); // Tracks if the user is an admin.

  // Check the user's login and admin status when the component mounts.
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch("/api/check-auth"); // Call the API to check login status.
        if (res.ok) {
          const data = await res.json(); // Parse the API response.
          setIsLoggedIn(true); // Set login state to true.
          setIsAdmin(data.isAdmin); // Set admin state based on the API response.
        }
      } catch (error) {
        // If an error occurs, reset the login and admin states.
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    checkLoginStatus(); // Invoke the login check function.
  }, []); // Empty array is used to ensure this runs only once when the component mounts.

  // Handle user logout.
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" }); // Call the logout API.
    setIsLoggedIn(false); // Reset login state.
    setIsAdmin(false); // Reset admin state.
    window.location.href = "/"; // Redirect to the homepage.
  };

  return (
    <nav className="navbar">
      {" "}
      {/* Main navigation container */}
      <div className="navbar__container">
        <h1 className="navbar__title">NourishMate</h1> {/* App title */}
        <ul className="navbar__list">
          {" "}
          {/* List of navigation links */}
          <li className="navbar__item">
            <Link href="/">Home</Link>
          </li>
          <li className="navbar__item">
            <Link href="/about">About</Link>
          </li>
          <li className="navbar__item">
            <Link href="/personalizedMeals">Personalized Meals</Link>
          </li>
          <li className="navbar__item">
            <Link href="/exploreMeals">Explore Meals</Link>
          </li>
          <li className="navbar__item">
            <Link href="/budgetTracker">Budget Tracker</Link>
          </li>
          <li className="navbar__item">
            <Link href="/calorieCalculator">Calorie Calculator</Link>
          </li>
          {isAdmin && ( // Only render the Admin Panel link if the user is an admin.
            <li className="navbar__item">
              <Link href="/adminPanel">Admin Panel</Link>
            </li>
          )}
        </ul>
        <div className="navbar__buttons">
          {" "}
          {/* Authentication buttons */}
          {!isLoggedIn ? ( // Show Register and Login buttons if the user is not logged in.
            <>
              <Link href="/register">
                <button className="navbar__button">Register</button>
              </Link>
              <Link href="/login">
                <button className="navbar__button">Login</button>
              </Link>
            </>
          ) : (
            // Show Account and Logout buttons if the user is logged in.
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

export default Navbar; // Export the Navbar component for use in other parts of the app.
