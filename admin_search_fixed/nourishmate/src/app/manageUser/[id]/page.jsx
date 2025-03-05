"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function UserDetails() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [editableData, setEditableData] = useState({});

  const activityLevels = [
    "Sedentary",
    "Light Activity",
    "Moderate Activity",
    "Active",
    "Very Active",
  ];

  const goals = ["Maintain Weight", "Weight Loss", "Weight Gain"];

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/get-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id }),
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();

        const { caloricData, budgetData, ...filteredUserData } = data;
        setUser(filteredUserData);
        setEditableData(filteredUserData);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [id]);

  const handleUpdateUser = async () => {
    try {
      const res = await fetch(`/api/admin/update-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, ...editableData }),
      });

      if (!res.ok) throw new Error("Failed to update user");
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/delete-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });

      if (!res.ok) throw new Error("Failed to delete user");

      alert("User deleted successfully!");
      router.push("/adminPanel");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (!user) return <p>Loading user data...</p>;

  return (
    <div>
      <Navbar />
      <h1>User Details</h1>

      {Object.entries(user)
        .filter(([key]) => key !== "_id" && key !== "password")
        .map(([key, value]) => (
          <div key={key}>
            <label>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
            {key === "activityLevel" ? (
              <select
                value={editableData[key] || ""}
                onChange={(e) =>
                  setEditableData({ ...editableData, [key]: e.target.value })
                }
              >
                <option value="">Select Activity Level</option>
                {activityLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            ) : key === "goal" ? (
              <select
                value={editableData[key] || ""}
                onChange={(e) =>
                  setEditableData({ ...editableData, [key]: e.target.value })
                }
              >
                <option value="">Select Goal</option>
                {goals.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={editableData[key] || ""}
                onChange={(e) =>
                  setEditableData({ ...editableData, [key]: e.target.value })
                }
              />
            )}
          </div>
        ))}

      <button onClick={handleUpdateUser}>Update User</button>
      <button
        onClick={handleDeleteUser}
        style={{ marginLeft: "10px", color: "red" }}
      >
        Delete User
      </button>
    </div>
  );
}
