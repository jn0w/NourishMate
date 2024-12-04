"use client";

// Import necessary modules and components
import React, { useState } from "react";
import "./globals.css"; // Global CSS for styling
import Navbar from "./components/Navbar"; // Navigation bar component
import SlidingPanel from "./components/SlidingPanel"; // Sliding panel component
import Footer from "./components/Footer"; // Footer component
import Card from "./components/Card"; // Card component for food items
import RegisterForm from "./components/RegisterForm"; // Registration form component

function HomePage() {
  // State for managing popup visibility
  const [showPopup, setShowPopup] = useState(false);
  // State for storing user activity level
  const [activityLevel, setActivityLevel] = useState("");
  // State for storing user goal
  const [goal, setGoal] = useState("");

  // Sample food items to display in the cards
  const foodItems = [
    {
      name: "Chicken",
      price: 5.2,
      isHighProtein: true,
      image: "https://via.placeholder.com/150?text=Chicken",
    },
    {
      name: "Beans",
      price: 0.89,
      isHighProtein: true,
      image: "https://via.placeholder.com/150?text=Beans",
    },
    {
      name: "Broccoli",
      price: 1.5,
      isHighProtein: false,
      image: "https://via.placeholder.com/150?text=Broccoli",
    },
    {
      name: "Salmon",
      price: 12.0,
      isHighProtein: true,
      image: "https://via.placeholder.com/150?text=Salmon",
    },
  ];

  // Function to handle form submission for personalized meal preferences
  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    try {
      // Send user preferences to the API
      const res = await fetch("/api/save-user-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activityLevel, goal }),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Data saved successfully: " + data.message);
        setShowPopup(false); // Close popup after saving preferences
      } else {
        alert("Failed to save data");
      }
    } catch (error) {
      console.error("Error saving user data:", error); // Log any errors
      alert("An error occurred");
    }
  };

  return (
    <div className="home-page">
      {/* Render the navigation bar */}
      <Navbar />
      <h1 className="title">Welcome to NourishMate!</h1>
      <p className="description">
        Start your journey to a healthier lifestyle.
      </p>
      {/* Sliding panel */}
      <SlidingPanel />

      {/* Button to open the popup for personalized meal plan */}
      <button
        className="personalized-meal-btn"
        onClick={() => setShowPopup(true)}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          display: "block",
          margin: "0 auto",
        }}
      >
        Click me for a personalized meal plan
      </button>

      {/* Popup form for entering user preferences */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Personalize Your Meal Plan</h2>
            <form onSubmit={handleFormSubmit}>
              <label>
                Activity Level:
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                Goal:
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="fat_loss">Fat Loss</option>
                  <option value="budget_meals">Budget Meals</option>
                </select>
              </label>
              <button type="submit" style={{ marginTop: "10px" }}>
                Save Preferences
              </button>
            </form>
            {/* Button to close the popup */}
            <button
              onClick={() => setShowPopup(false)}
              style={{ marginTop: "10px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Render cards for the sample food items */}
      <div className="cards-container">
        {foodItems.map((item, index) => (
          <Card key={index} food={item} />
        ))}
      </div>

      {/* Render the footer */}
      <Footer />
    </div>
  );
}

export default HomePage;
