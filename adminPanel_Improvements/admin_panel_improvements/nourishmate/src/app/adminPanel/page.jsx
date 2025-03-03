"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function AdminPanel() {
  // Meal Management
  const [meals, setMeals] = useState([]);
  const [mealName, setMealName] = useState("");
  const [category, setCategory] = useState("");
  const [calorieCategory, setCalorieCategory] = useState("");
  const [budgetCategory, setBudgetCategory] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [ingredientName, setIngredientName] = useState("");
  const [unit, setUnit] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  // User Management
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchMeals();
    fetchUsers();
  }, []);

  // Fetch all meals
  const fetchMeals = async () => {
    try {
      const res = await fetch("/api/meals");
      if (!res.ok) throw new Error(`Error fetching meals: ${res.status}`);
      const data = await res.json();
      setMeals(data);
    } catch (error) {
      console.error("Failed to fetch meals:", error);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/get-users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // Add new ingredient to meal
  const handleAddIngredient = () => {
    if (!ingredientName || !unit || !calories || !protein || !carbs || !fats) {
      alert("Please enter all ingredient details including macros.");
      return;
    }

    const newIngredient = {
      name: ingredientName,
      unit,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
    };

    setIngredients([...ingredients, newIngredient]);

    // Clear input fields after adding
    setIngredientName("");
    setUnit("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
  };

  // Add new meal
  const handleAddMeal = async () => {
    if (
      !mealName ||
      !calorieCategory ||
      !budgetCategory ||
      !estimatedCost ||
      ingredients.length === 0
    ) {
      alert("Please fill in all fields and add at least one ingredient.");
      return;
    }

    const newMeal = {
      name: mealName,
      category,
      calorieCategory,
      budgetCategory,
      estimatedCost: parseFloat(estimatedCost),
      ingredients,
      totalCalories: ingredients.reduce(
        (sum, ing) => sum + Number(ing.calories || 0),
        0
      ),
      totalProtein: ingredients.reduce(
        (sum, ing) => sum + Number(ing.protein || 0),
        0
      ),
      totalCarbs: ingredients.reduce(
        (sum, ing) => sum + Number(ing.carbs || 0),
        0
      ),
      totalFats: ingredients.reduce(
        (sum, ing) => sum + Number(ing.fats || 0),
        0
      ),
    };

    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMeal),
      });

      if (!res.ok) throw new Error("Failed to add meal");
      const data = await res.json();

      setMeals([...meals, { ...newMeal, _id: data.mealId }]);
      setMealName("");
      setCategory("");
      setCalorieCategory("");
      setBudgetCategory("");
      setEstimatedCost("");
      setIngredients([]);
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  };

  // Delete meal
  const handleDeleteMeal = async (mealId) => {
    try {
      const res = await fetch(`/api/meals/${mealId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete meal");
      setMeals(meals.filter((meal) => meal._id !== mealId));
    } catch (error) {
      console.error(error);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error("Failed to delete user");
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Edit user details
  const handleEditUser = async (userId) => {
    const updatedName = prompt("Enter new name:");
    const updatedEmail = prompt("Enter new email:");
    const updatedActivityLevel = prompt("Enter new activity level:");
    const updatedGoal = prompt("Enter new goal:");

    if (!updatedName || !updatedEmail) return;

    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: updatedName,
          email: updatedEmail,
          activityLevel: updatedActivityLevel,
          goal: updatedGoal,
        }),
      });

      if (!res.ok) throw new Error("Failed to update user");
      setUsers(
        users.map((user) =>
          user._id === userId
            ? {
                ...user,
                name: updatedName,
                email: updatedEmail,
                activityLevel: updatedActivityLevel,
                goal: updatedGoal,
              }
            : user
        )
      );
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Admin Panel</h1>

      {/* 🔹 User Management Section */}
      <h2>Manage Users</h2>
      <table border="1" style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                <a
                  href={`../manageUser/${user._id}`}
                  style={{
                    textDecoration: "none",
                    color: "blue",
                    cursor: "pointer",
                  }}
                >
                  {user.email}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 Meal Management Section */}
      <h2>Add a New Meal</h2>
      <input
        type="text"
        placeholder="Meal Name"
        value={mealName}
        onChange={(e) => setMealName(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Select Category</option>
        <option value="budget_meals">Budget Meals</option>
        <option value="fat_loss">Fat Loss</option>
        <option value="muscle_gain">Muscle Gain</option>
      </select>
      <select
        value={calorieCategory}
        onChange={(e) => setCalorieCategory(e.target.value)}
      >
        <option value="">Select Calorie Category</option>
        <option value="low">Low</option>
        <option value="moderate">Moderate</option>
        <option value="high">High</option>
      </select>

      <select
        value={budgetCategory}
        onChange={(e) => setBudgetCategory(e.target.value)}
      >
        <option value="">Select Budget Category</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <input
        type="text"
        placeholder="Estimated Cost (€)"
        value={estimatedCost}
        onChange={(e) => setEstimatedCost(e.target.value)}
      />

      <h3>Add Ingredient</h3>
      <input
        type="text"
        placeholder="Ingredient Name"
        value={ingredientName}
        onChange={(e) => setIngredientName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Unit (e.g., grams)"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
      />
      <input
        type="number"
        placeholder="Calories"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
      />
      <input
        type="number"
        placeholder="Protein (g)"
        value={protein}
        onChange={(e) => setProtein(e.target.value)}
      />
      <input
        type="number"
        placeholder="Carbs (g)"
        value={carbs}
        onChange={(e) => setCarbs(e.target.value)}
      />
      <input
        type="number"
        placeholder="Fats (g)"
        value={fats}
        onChange={(e) => setFats(e.target.value)}
      />
      <button onClick={handleAddIngredient}>Add Ingredient</button>

      <h4>Ingredients</h4>
      <ul>
        {ingredients.map((ing, index) => (
          <li key={index}>
            <strong>{ing.name}</strong> - {ing.unit}, <strong>Calories:</strong>{" "}
            {ing.calories} kcal, <strong>Protein:</strong> {ing.protein}g,{" "}
            <strong>Carbs:</strong> {ing.carbs}g, <strong>Fats:</strong>{" "}
            {ing.fats}g
          </li>
        ))}
      </ul>

      <button onClick={handleAddMeal}>Add Meal</button>

      <h2>Existing Meals</h2>
      <ul>
        {meals.map((meal) => (
          <li key={meal._id}>
            <strong>{meal.name}</strong> - {meal.category} -{" "}
            {meal.calorieCategory} - {meal.budgetCategory} - €
            {meal.estimatedCost}
            <br />
            <strong>Calories:</strong> {meal.totalCalories} kcal,{" "}
            <strong>Protein:</strong> {meal.totalProtein}g,{" "}
            <strong>Carbs:</strong> {meal.totalCarbs}g, <strong>Fats:</strong>{" "}
            {meal.totalFats}g
            <br />
            <button onClick={() => handleDeleteMeal(meal._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
