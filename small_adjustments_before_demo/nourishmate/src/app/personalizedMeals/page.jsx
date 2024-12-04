"use client";

// Import necessary modules
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

// Component for displaying personalized meals
export default function PersonalizedMealsPage() {
  // State to store user data and meals
  const [userData, setUserData] = useState(null);
  const [meals, setMeals] = useState([]);

  // useEffect to fetch user data and personalized meals on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user authentication data
        const response = await fetch("/api/check-auth", {
          credentials: "include", // Include credentials for cookie-based authentication
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data); // Store user data in state

          // Fetch meals based on user's goal
          const mealResponse = await fetch(
            `/api/personalizedMeals?goal=${data.goal}`
          );
          if (mealResponse.ok) {
            const mealData = await mealResponse.json();
            setMeals(mealData); // Store personalized meals in state
          }
        }
      } catch (error) {
        console.error("Error fetching personalized meals:", error); // Log any errors
      }
    };

    fetchUserData(); // fetch the data
  }, []); // Empty dependency array ensures this runs only once on mount

  // Display loading message while user data is being fetched
  if (!userData) {
    return (
      <div>
        <Navbar />
        <h1>Personalized Meals</h1>
        <p>Loading personalized meal recommendations...</p>
      </div>
    );
  }

  // Render personalized meals or a fallback message if no meals match
  return (
    <div>
      {/* Navbar at the top of the page */}
      <Navbar />
      <h1>Personalized Meals for {userData.name}</h1>
      <p>Based on your goal ({userData.goal})</p>
      {meals.length > 0 ? (
        // Display the list of personalized meals
        <ul>
          {meals.map((meal) => (
            <li key={meal._id}>
              <h3>{meal.name}</h3>
              <p>Total Calories: {meal.totalCalories}</p>
              <p>
                Protein: {meal.totalProtein}g, Carbs: {meal.totalCarbs}g, Fats:{" "}
                {meal.totalFats}g
              </p>
              <h4>Ingredients:</h4>
              <ul>
                {/* Display each ingredient's details */}
                {meal.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.name} - {ingredient.quantity} {ingredient.unit},{" "}
                    {ingredient.calories} kcal
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        // Message if no meals match user preferences
        <p>No meals match your preferences at the moment. Check back later!</p>
      )}
    </div>
  );
}
