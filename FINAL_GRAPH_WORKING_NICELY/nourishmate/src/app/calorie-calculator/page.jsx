"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function CalorieCalculator() {
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [specificGoal, setSpecificGoal] = useState(""); // State for specific goal
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [weightEntries, setWeightEntries] = useState([]);
  const [inputWeight, setInputWeight] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [user, setUser] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false); // ✅ New state for Delete Mode

  const validateInputs = () => {
    const newErrors = {};
    if (!gender) newErrors.gender = "Please select your gender.";
    if (!activityLevel)
      newErrors.activityLevel = "Please select your activity level.";
    if (!goal) newErrors.goal = "Please select your goal.";
    if ((goal === "weight_loss" || goal === "weight_gain") && !specificGoal)
      newErrors.specificGoal = "Please select a specific goal.";
    if (!weight || weight <= 0)
      newErrors.weight = "Please enter a valid weight.";
    if (!height || height <= 0)
      newErrors.height = "Please enter a valid height.";
    if (!age || age <= 0) newErrors.age = "Please enter a valid age.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchWeightData = async () => {
      try {
        console.log("🔄 Fetching authentication...");

        const response = await fetch("/api/check-auth", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          console.log("✅ User authenticated:", data.user);

          console.log("🔄 Fetching weight history...");
          const weightResponse = await fetch("/api/get-weight-history", {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });

          if (weightResponse.ok) {
            let weightData = await weightResponse.json();
            console.log("✅ Raw weight data received:", weightData);

            if (Array.isArray(weightData) && weightData.length > 0) {
              weightData.sort((a, b) => new Date(a.date) - new Date(b.date)); // ✅ Correct sorting
              console.log("✅ Sorted weight data:", weightData);
              setWeightEntries(weightData);
            } else {
              console.warn("⚠️ No weight data found for user.");
              setWeightEntries([]); // Ensure state is cleared if no data
            }
          } else {
            console.error("❌ Failed to fetch weight history.");
          }
        } else {
          console.error("❌ User is not authenticated.");
        }
      } catch (error) {
        console.error("❌ Error checking authentication:", error);
      }
    };

    fetchWeightData();
  }, []); // ✅ Keep dependency array empty to run only on page load

  const getTokenFromCookies = () => {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((row) => row.startsWith("token="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  };

  const handleAddWeightEntry = async () => {
    if (!inputWeight || !inputDate) {
      alert("Please enter a weight and date.");
      return;
    }

    if (!user) {
      alert("You must be logged in to track weight.");
      return;
    }

    try {
      console.log("🔄 Adding weight entry...");
      const response = await fetch("/api/save-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: inputDate,
          weight: parseFloat(inputWeight),
        }),
        credentials: "include",
      });

      if (response.ok) {
        console.log("✅ Weight entry saved!");

        // ✅ Update the weightEntries state dynamically instead of fetching all data again
        setWeightEntries((prevEntries) => {
          const updatedEntries = [
            ...prevEntries,
            { date: inputDate, weight: parseFloat(inputWeight) },
          ];
          updatedEntries.sort((a, b) => new Date(a.date) - new Date(b.date)); // ✅ Ensure sorting
          return updatedEntries;
        });

        setInputWeight("");
        setInputDate("");
      } else {
        console.error("❌ Failed to save weight entry.");
        alert("Failed to save weight entry. Try again.");
      }
    } catch (error) {
      console.error("❌ Error saving weight entry:", error);
    }
  };

  const handleDeleteWeightEntry = async (entryId) => {
    if (!entryId) {
      console.error("❌ Entry ID is missing when calling delete function.");
      alert("Error: Entry ID is missing.");
      return;
    }

    if (!user) {
      alert("You must be logged in to delete weight entries.");
      return;
    }

    try {
      console.log("🗑 Deleting weight entry with ID:", entryId);

      const response = await fetch("/api/remove-weight-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entryId }), // ✅ Ensure entryId is sent correctly
        credentials: "include",
      });

      const result = await response.json(); // Read the response

      if (response.ok) {
        console.log("✅ Weight entry deleted successfully:", result);

        // ✅ Remove the deleted entry from state
        setWeightEntries((prevEntries) =>
          prevEntries.filter((entry) => entry._id !== entryId)
        );
      } else {
        console.error("❌ Failed to delete weight entry:", result);
        alert(result.error || "Failed to delete weight entry. Try again.");
      }
    } catch (error) {
      console.error("❌ Error deleting weight entry:", error);
    }
  };

  const handleCalculate = async () => {
    setResults(null); // Clear previous results
    if (!validateInputs()) return;

    try {
      const response = await fetch("/api/calorie-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          weight,
          height,
          age,
          activityLevel,
          goal,
          specificGoal, // Include specific goal
        }),
      });
      const data = await response.json();
      setResults(data); // Update with new results
    } catch (error) {
      console.error("Error calculating calories:", error);
    }
  };

  const handleSave = async () => {
    if (!results) {
      setSuccessMessage("No results to save. Please calculate first.");
      return;
    }

    try {
      const response = await fetch("/api/save-calories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bmr: results.bmr,
          tdee: results.tdee,
          targetCalories: results.targetCalories,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Caloric data saved to your profile successfully.");
      } else {
        setSuccessMessage("Failed to save data to your profile.");
      }
    } catch (error) {
      console.error("Error saving caloric data:", error);
      setSuccessMessage("An error occurred while saving data.");
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h1>Calorie Calculator</h1>
        <div>
          <label>
            Gender:
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                setResults(null);
              }}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <p style={{ color: "red" }}>{errors.gender}</p>}
          </label>
        </div>
        <div>
          <label>
            Weight (kg):
            <input
              type="number"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setResults(null);
              }}
            />
            {errors.weight && <p style={{ color: "red" }}>{errors.weight}</p>}
          </label>
        </div>
        <div>
          <label>
            Height (cm):
            <input
              type="number"
              value={height}
              onChange={(e) => {
                setHeight(e.target.value);
                setResults(null);
              }}
            />
            {errors.height && <p style={{ color: "red" }}>{errors.height}</p>}
          </label>
        </div>
        <div>
          <label>
            Age:
            <input
              type="number"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                setResults(null);
              }}
            />
            {errors.age && <p style={{ color: "red" }}>{errors.age}</p>}
          </label>
        </div>
        <div>
          <label>
            Activity Level:
            <select
              value={activityLevel}
              onChange={(e) => {
                setActivityLevel(e.target.value);
                setResults(null);
              }}
            >
              <option value="">Select Activity Level</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light Activity</option>
              <option value="moderate">Moderate Activity</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
            {errors.activityLevel && (
              <p style={{ color: "red" }}>{errors.activityLevel}</p>
            )}
          </label>
        </div>

        <div>
          <label>
            Goal:
            <select
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value);
                setSpecificGoal(""); // Reset specific goal
                setResults(null);
              }}
            >
              <option value="">Select Goal</option>
              <option value="maintain">Maintain Weight</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="weight_gain">Weight Gain</option>
            </select>
            {errors.goal && <p style={{ color: "red" }}>{errors.goal}</p>}
          </label>
        </div>
        {(goal === "weight_loss" || goal === "weight_gain") && (
          <div>
            <label>
              Specific Goal:
              <select
                value={specificGoal}
                onChange={(e) => setSpecificGoal(e.target.value)}
              >
                <option value="">Select Specific Goal</option>
                {goal === "weight_loss" && (
                  <>
                    <option value="mild_weight_loss">
                      Mild Weight Loss (0.25 kg/week)
                    </option>
                    <option value="weight_loss">
                      Weight Loss (0.5 kg/week)
                    </option>
                    <option value="extreme_weight_loss">
                      Extreme Weight Loss (1 kg/week)
                    </option>
                  </>
                )}
                {goal === "weight_gain" && (
                  <>
                    <option value="mild_weight_gain">
                      Mild Weight Gain (0.25 kg/week)
                    </option>
                    <option value="weight_gain">
                      Weight Gain (0.5 kg/week)
                    </option>
                    <option value="extreme_weight_gain">
                      Extreme Weight Gain (1 kg/week)
                    </option>
                  </>
                )}
              </select>
              {errors.specificGoal && (
                <p style={{ color: "red" }}>{errors.specificGoal}</p>
              )}
            </label>
          </div>
        )}
        <button onClick={handleCalculate}>Calculate</button>
        {results && (
          <div>
            <h2>Results:</h2>
            <p>
              <strong>BMR:</strong> {results.bmr} kcal/day
            </p>
            <p>
              <strong>TDEE:</strong> {results.tdee} kcal/day
            </p>
            <p>
              <strong>Calorie Target:</strong> {results.targetCalories} kcal/day
            </p>
            <button onClick={handleSave}>Save to Profile</button>
          </div>
        )}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

        {/* Explanation Cards (Shown Below Results) */}
        {results && (
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
            }}
          >
            <h2>What These Numbers Mean:</h2>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div
                style={{
                  flex: "1",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  backgroundColor: "#fff",
                  textAlign: "center",
                }}
              >
                <h3>BMR (Basal Metabolic Rate)</h3>
                <p>
                  Your BMR represents the number of calories your body burns at
                  rest to maintain basic functions like breathing, circulation,
                  and cell production.
                </p>
              </div>

              <div
                style={{
                  flex: "1",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  backgroundColor: "#fff",
                  textAlign: "center",
                }}
              >
                <h3>TDEE (Total Daily Energy Expenditure)</h3>
                <p>
                  Your TDEE is the total number of calories you burn in a day,
                  including all activities such as walking, exercising, and
                  daily tasks. It is calculated by multiplying your BMR by an
                  activity factor.
                </p>
              </div>

              <div
                style={{
                  flex: "1",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  backgroundColor: "#fff",
                  textAlign: "center",
                }}
              >
                <h3>Calorie Target</h3>
                <p>
                  Your calorie target is based on your goal: <br />
                  <strong>Maintain Weight:</strong> Matches your TDEE. <br />
                  <strong>Lose Weight:</strong> Below TDEE to create a calorie
                  deficit. <br />
                  <strong>Gain Weight:</strong> Above TDEE to create a calorie
                  surplus.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Weight Tracking Section */}
        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2>Track Your Weight</h2>
          <p>Enter your weight and date to monitor progress.</p>

          <div>
            <input
              type="number"
              placeholder="Enter weight (kg)"
              value={inputWeight}
              onChange={(e) => setInputWeight(e.target.value)}
              style={{ marginRight: "10px" }}
            />
            <input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              style={{ marginRight: "10px" }}
            />
            <button onClick={handleAddWeightEntry}>Add Entry</button>
          </div>

          {/* ✅ Delete Mode Toggle Button (Appears Only Once) */}
          <button
            onClick={() => setDeleteMode(!deleteMode)}
            style={{
              marginBottom: "10px",
              padding: "8px 12px",
              backgroundColor: deleteMode ? "darkred" : "gray",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {deleteMode ? "Exit Delete Mode" : "Delete Entries"}
          </button>

          {/* ✅ Show weight entries ONLY when Delete Mode is active */}
          {deleteMode && weightEntries.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {weightEntries.map((entry) => (
                <li key={entry._id} style={{ marginBottom: "10px" }}>
                  {new Date(entry.date).toLocaleDateString("en-GB")} -{" "}
                  {entry.weight} kg
                  {/* ✅ Delete button appears only inside Delete Mode */}
                  <button
                    onClick={() => handleDeleteWeightEntry(entry._id)}
                    style={{
                      marginLeft: "10px",
                      padding: "4px 8px",
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    ❌ Delete
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* ✅ Graph is always visible */}
          <Line
            data={{
              labels: weightEntries.map((entry) =>
                new Date(entry.date).toLocaleDateString("en-GB")
              ),
              datasets: [
                {
                  label: "Weight Over Time",
                  data: weightEntries.map((entry) => entry.weight),
                  fill: false,
                  borderColor: "blue",
                  tension: 0.1,
                },
              ],
            }}
          />
        </div>
      </div>
    </>
  );
}
