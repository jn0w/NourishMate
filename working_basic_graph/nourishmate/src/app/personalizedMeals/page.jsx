"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function PersonalizedMealsPage() {
  const [userData, setUserData] = useState(null);
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/check-auth", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);

          // Fetch meals based only on user's goal
          const mealResponse = await fetch(
            `/api/personalizedMeals?goal=${data.goal}`
          );
          if (mealResponse.ok) {
            const mealData = await mealResponse.json();
            setMeals(mealData);
          }
        }
      } catch (error) {
        console.error("Error fetching personalized meals:", error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return (
      <div>
        <Navbar />
        <h1>Personalized Meals</h1>
        <p>Loading personalized meal recommendations...</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <h1>Personalized Meals for {userData.name}</h1>
      <p>Based on your goal ({userData.goal})</p>
      {meals.length > 0 ? (
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
        <p>No meals match your preferences at the moment. Check back later!</p>
      )}
    </div>
  );
}
