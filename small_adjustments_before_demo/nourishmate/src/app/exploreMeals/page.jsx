"use client";

// Import necessary dependencies
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

// Component for exploring meals
export default function ExploreMealsPage() {
  // State to store the list of meals
  const [meals, setMeals] = useState([]);

  // Fetch meals from the API when the component is mounted
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch("/api/meals"); // API call to fetch meals
        if (response.ok) {
          const data = await response.json(); // Parse the JSON response
          setMeals(data); // Update the meals state with the fetched data
        }
      } catch (error) {
        console.error("Error fetching meals:", error); // Log any errors
      }
    };

    fetchMeals(); // Call the fetch function
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div>
      {/* Navbar component */}
      <Navbar />
      <h1>Meals</h1>
      {/* Render a list of meals */}
      <ul>
        {meals.map((meal) => (
          <li key={meal._id}>
            <h2>{meal.name}</h2>
            <p>Total Calories: {meal.totalCalories}</p>
            <p>Total Protein: {meal.totalProtein}g</p>
            <p>Total Carbs: {meal.totalCarbs}g</p>
            <p>Total Fats: {meal.totalFats}g</p>
            <h3>Ingredients:</h3>
            {/* Render a list of ingredients for each meal */}
            <ul>
              {meal.ingredients.map((ingredient) => (
                <li key={ingredient.name}>
                  {ingredient.name} - Quantity: {ingredient.quantity}{" "}
                  {ingredient.unit}
                  <ul>
                    <li>Calories: {ingredient.calories}</li>
                    <li>Protein: {ingredient.protein}g</li>
                    <li>Carbs: {ingredient.carbs}g</li>
                    <li>Fats: {ingredient.fats}g</li>
                  </ul>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
