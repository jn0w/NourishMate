"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function PersonalizedMealsPage() {
  const [userData, setUserData] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Added loading state

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // ✅ Fetch authenticated user details
        const response = await fetch("/api/check-auth", {
          credentials: "include",
        });

        if (!response.ok) {
          console.error("Failed to fetch user data");
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Check-auth API Response:", data); // ✅ Debugging log

        if (!data.user || !data.user.email) {
          console.error("User data or email is missing in check-auth response");
          setLoading(false);
          return;
        }

        setUserData(data.user);

        // ✅ Fetch meals only if email exists
        if (data.user.email) {
          const mealResponse = await fetch(
            `/api/personalizedMeals?email=${encodeURIComponent(
              data.user.email
            )}`
          );
          if (mealResponse.ok) {
            const mealData = await mealResponse.json();
            setMeals(mealData);
          } else {
            console.error("Failed to fetch meals");
          }
        }
      } catch (error) {
        console.error("Error fetching personalized meals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <h1>Personalized Meals</h1>
        <p>Loading personalized meal recommendations...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div>
        <Navbar />
        <h1>Personalized Meals</h1>
        <p>Error loading user data. Please try again.</p>
      </div>
    );
  }

  // ✅ Ensure default values for missing data
  const caloricData = userData.caloricData || { targetCalories: 0 };
  const budgetData = userData.budgetData || {
    budgetAmount: 0,
    budgetType: "weekly",
  };

  return (
    <div>
      <Navbar />
      <h1>Personalized Meals for {userData.name || "User"}</h1>
      <p>
        Budget: <strong>€{budgetData.budgetAmount}</strong> (
        {budgetData.budgetType}), Calorie Target:{" "}
        <strong>{caloricData.targetCalories} kcal</strong>
      </p>

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
              <p>Estimated Cost: €{meal.estimatedCost.toFixed(2)}</p>
              <h4>Ingredients:</h4>
              <ul>
                {meal.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.name} - {ingredient.quantity}{" "}
                    {ingredient.unit ? ingredient.unit : "g"},{" "}
                    {ingredient.calories} kcal
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>No meals match your preferences. Try adjusting your budget.</p>
      )}
    </div>
  );
}
