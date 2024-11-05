"use client";

import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import Navbar from "../components/Navbar";

export default function AccountPage() {
  const [userData, setUserData] = useState(null);

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
        </ul>
      </div>
    </div>
  );
}
