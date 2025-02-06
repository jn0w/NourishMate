"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

export default function AccountPage() {
  const [userData, setUserData] = useState(null);
  const router = useRouter(); // Initialize the router for navigation

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/check-auth", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.log("Not authorized");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    checkAuth();
  }, []);

  if (!userData) {
    return (
      <div>
        <Navbar />
        <h1>Account Page</h1>
        <p>Loading account details...</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <h1>Account Page</h1>
      <div>
        <h2>Welcome, {userData.name || userData.email}!</h2>
        <p>Here is your account information:</p>
        <ul>
          <li>
            <strong>Name:</strong> {userData.name}
          </li>
          <li>
            <strong>Email:</strong> {userData.email}
          </li>
          <li>
            <strong>Address:</strong> {userData.address}
          </li>
          <li>
            <strong>Phone Number:</strong> {userData.phoneNumber}
          </li>
          <li>
            <strong>Activity Level:</strong>{" "}
            {userData.activityLevel || "Not specified"}
          </li>
          <li>
            <strong>Goal:</strong> {userData.goal || "Not specified"}
          </li>
        </ul>
      </div>
      <div>
        <h3>Nutrition Information</h3>
        {userData.caloricData ? (
          <ul>
            <li>
              <strong>BMR:</strong> {userData.caloricData.bmr} kcal/day
            </li>
            <li>
              <strong>TDEE:</strong> {userData.caloricData.tdee} kcal/day
            </li>
            <li>
              <strong>Calorie Target:</strong>{" "}
              {userData.caloricData.targetCalories} kcal/day
            </li>
          </ul>
        ) : (
          <p>
            No caloric data available. Please calculate your calories and save
            them to your profile.
          </p>
        )}
        {/* Button to navigate to Calorie Calculator */}
        <button
          style={{
            marginTop: "10px",
            padding: "10px 15px",
            fontSize: "16px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => router.push("/calorie-calculator")}
        >
          Go to Calorie Calculator
        </button>
      </div>
    </div>
  );
}
