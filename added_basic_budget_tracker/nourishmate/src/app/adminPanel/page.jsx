"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function AdminPanel() {
  const [meals, setMeals] = useState([]);
  const [mealName, setMealName] = useState("");
  const [category, setCategory] = useState("");
  const [activity, setActivity] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetch("/api/meals");
        if (!res.ok) {
          throw new Error(
            `Error fetching meals: ${res.status} ${res.statusText}`
          );
        }
        const data = await res.json();
        setMeals(data);
      } catch (error) {
        console.error("Failed to fetch meals:", error);
      }
    };

    fetchMeals();
  }, []);

  const handleAddIngredient = () => {
    const newIngredient = {
      name: ingredientName,
      quantity,
      unit,
      calories,
      protein,
      carbs,
      fats,
    };
    setIngredients([...ingredients, newIngredient]);
    setIngredientName("");
    setQuantity("");
    setUnit("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
  };

  const handleAddMeal = async () => {
    const newMeal = {
      name: mealName,
      category,
      activity,
      ingredients,
      totalCalories: ingredients.reduce(
        (sum, ing) => sum + Number(ing.calories),
        0
      ),
      totalProtein: ingredients.reduce(
        (sum, ing) => sum + Number(ing.protein),
        0
      ),
      totalCarbs: ingredients.reduce((sum, ing) => sum + Number(ing.carbs), 0),
      totalFats: ingredients.reduce((sum, ing) => sum + Number(ing.fats), 0),
    };

    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMeal),
      });

      if (!res.ok) throw new Error("Failed to add meal");

      const data = await res.json();
      console.log("Meal added successfully:", data);
      setMeals((prevMeals) => [...prevMeals, { ...newMeal, _id: data.mealId }]);
      setMealName("");
      setCategory("");
      setActivity("");
      setIngredients([]);
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      const res = await fetch(`/api/meals/${mealId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete meal");
      setMeals((prevMeals) => prevMeals.filter((meal) => meal._id !== mealId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Admin Panel</h1>
      <h2>Add a New Meal</h2>
      <input
        type="text"
        placeholder="Meal Name"
        value={mealName}
        onChange={(e) => setMealName(e.target.value)}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ marginLeft: "10px", marginBottom: "10px" }}
      >
        <option value="">Select Category</option>
        <option value="budget_meals">Budget Meals</option>
        <option value="fat_loss">Fat Loss</option>
        <option value="muscle_gain">Muscle Gain</option>
      </select>
      <select
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        style={{ marginLeft: "10px", marginBottom: "10px" }}
      >
        <option value="">Select Activity Level</option>
        <option value="low">Low</option>
        <option value="moderate">Moderate</option>
        <option value="high">High</option>
      </select>
      <h3>Add Ingredient</h3>
      <input
        type="text"
        placeholder="Ingredient Name"
        value={ingredientName}
        onChange={(e) => setIngredientName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <input
        type="text"
        placeholder="Unit (e.g., grams)"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
      />
      <input
        type="text"
        placeholder="Calories"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
      />
      <input
        type="text"
        placeholder="Protein (g)"
        value={protein}
        onChange={(e) => setProtein(e.target.value)}
      />
      <input
        type="text"
        placeholder="Carbs (g)"
        value={carbs}
        onChange={(e) => setCarbs(e.target.value)}
      />
      <input
        type="text"
        placeholder="Fats (g)"
        value={fats}
        onChange={(e) => setFats(e.target.value)}
      />
      <button onClick={handleAddIngredient}>Add Ingredient</button>
      <h4>Ingredients for {mealName}</h4>
      <ul>
        {ingredients.map((ing, index) => (
          <li key={index}>
            {ing.name} - Quantity: {ing.quantity} {ing.unit}, Calories:{" "}
            {ing.calories}, Protein: {ing.protein}g, Carbs: {ing.carbs}g, Fats:{" "}
            {ing.fats}g
          </li>
        ))}
      </ul>
      <button onClick={handleAddMeal}>Add Meal</button>
      <h2>Existing Meals</h2>
      <ul>
        {meals.map((meal) => (
          <li key={meal._id}>
            {meal.name} - {meal.category} - {meal.activity}
            <button onClick={() => handleDeleteMeal(meal._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
