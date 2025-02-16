"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function ExploreMealsPage() {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch("/api/meals");
        if (response.ok) {
          const data = await response.json();
          setMeals(data);
        }
      } catch (error) {
        console.error("Error fetching meals:", error);
      }
    };

    fetchMeals();
  }, []);

  return (
    <div>
      <Navbar />
      <h1>Meals</h1>
      <ul>
        {meals.map((meal) => (
          <li key={meal._id}>
            <h2>{meal.name}</h2>
            <p>Total Calories: {meal.totalCalories}</p>
            <p>Total Protein: {meal.totalProtein}g</p>
            <p>Total Carbs: {meal.totalCarbs}g</p>
            <p>Total Fats: {meal.totalFats}g</p>
            <h3>Ingredients:</h3>
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
