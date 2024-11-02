// src/app/page.js
"use client"; // Add this if you're using hooks

import React from "react";
import "./globals.css"; // Correct path to globals.css
import Navbar from "./components/Navbar";
import SlidingPanel from "./components/SlidingPanel";
import Footer from "./components/Footer";
import Card from "./components/Card";
import RegisterForm from "./components/RegisterForm";

function HomePage() {
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

  return (
    <div className="home-page">
      <Navbar />
      <h1 className="title">Welcome to NourishMate!</h1>

      <p className="description">
        Start your journey to a healthier lifestyle.
      </p>
      <SlidingPanel />
      <div className="cards-container">
        {foodItems.map((item, index) => (
          <Card key={index} food={item} />
        ))}
      </div>

      <Footer />
    </div>
  );
}

export default HomePage;
