"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";

export default function MealLoggerPage() {
  const [userData, setUserData] = useState(null);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [meals, setMeals] = useState([]);
  const [availableMeals, setAvailableMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [customMeal, setCustomMeal] = useState({ name: "", calories: "" });
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [remainingCalories, setRemainingCalories] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch user data and available meals on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/check-auth", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);

          // Initialize remaining calories
          if (data.user.caloricData) {
            setRemainingCalories(data.user.caloricData.targetCalories);
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    const fetchAvailableMeals = async () => {
      try {
        const response = await fetch("/api/meal-logger/available-meals");
        if (response.ok) {
          const data = await response.json();
          setAvailableMeals(data.meals || []);
        }
      } catch (error) {
        console.error("Error fetching available meals:", error);
      }
    };

    checkAuth();
    fetchAvailableMeals();
  }, [router]);

  // Fetch meals for the selected date
  useEffect(() => {
    const fetchMeals = async () => {
      if (!userData) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/meal-logger/get-logs?date=${date}`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setMeals(data.meals || []);

          // Calculate calories consumed
          const consumed = (data.meals || []).reduce(
            (sum, meal) => sum + (parseInt(meal.calories) || 0),
            0
          );
          setCaloriesConsumed(consumed);

          // Calculate remaining calories
          if (userData.caloricData) {
            setRemainingCalories(
              userData.caloricData.targetCalories - consumed
            );
          }
        }
      } catch (error) {
        console.error("Error fetching meals:", error);
        toast.error("Failed to load meals for this date");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeals();
  }, [date, userData]);

  const handleAddMeal = async () => {
    if (!selectedMeal && (!customMeal.name || !customMeal.calories)) {
      toast.error("Please select a meal or enter custom meal details");
      return;
    }

    let mealToAdd;

    if (selectedMeal) {
      // Find the selected meal from available meals
      const meal = availableMeals.find((m) => m._id === selectedMeal);
      if (!meal) {
        toast.error("Selected meal not found");
        return;
      }

      mealToAdd = {
        name: meal.name,
        calories: meal.totalCalories,
        type: "predefined",
        originalId: meal._id,
      };
    } else {
      // Use custom meal
      if (isNaN(parseInt(customMeal.calories))) {
        toast.error("Calories must be a number");
        return;
      }

      mealToAdd = {
        name: customMeal.name,
        calories: parseInt(customMeal.calories),
        type: "custom",
      };
    }

    // Add the meal to the list
    const updatedMeals = [...meals, mealToAdd];

    // Update the state
    setMeals(updatedMeals);

    // Calculate new calories consumed and remaining
    const newCaloriesConsumed = updatedMeals.reduce(
      (sum, meal) => sum + (parseInt(meal.calories) || 0),
      0
    );
    setCaloriesConsumed(newCaloriesConsumed);

    if (userData.caloricData) {
      setRemainingCalories(
        userData.caloricData.targetCalories - newCaloriesConsumed
      );
    }

    // Save to database
    try {
      const response = await fetch("/api/meal-logger/log-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          meals: updatedMeals,
        }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Meal added successfully");

        // Reset form
        setSelectedMeal("");
        setCustomMeal({ name: "", calories: "" });

        // Show achievement notification if any
        if (data.newAchievements && data.newAchievements.length > 0) {
          data.newAchievements.forEach((achievement) => {
            toast.success(
              <div className="flex items-center gap-2">
                <span className="text-xl">{achievement.icon || "🏆"}</span>
                <div>
                  <p className="font-bold">New Achievement Unlocked!</p>
                  <p>
                    {achievement.name}: {achievement.description}
                  </p>
                </div>
              </div>,
              {
                duration: 5000,
                style: {
                  background: "linear-gradient(to right, #fef6e4, #fffbeb)",
                  padding: "16px",
                  color: "#1a1a1a",
                  border: "1px solid #fde68a",
                },
              }
            );
          });
        }
      } else {
        toast.error("Failed to save meal");
      }
    } catch (error) {
      console.error("Error saving meal:", error);
      toast.error("Failed to save meal");
    }
  };

  const handleRemoveMeal = async (index) => {
    const updatedMeals = [...meals];
    updatedMeals.splice(index, 1);

    setMeals(updatedMeals);

    // Calculate new calories consumed and remaining
    const newCaloriesConsumed = updatedMeals.reduce(
      (sum, meal) => sum + (parseInt(meal.calories) || 0),
      0
    );
    setCaloriesConsumed(newCaloriesConsumed);

    if (userData.caloricData) {
      setRemainingCalories(
        userData.caloricData.targetCalories - newCaloriesConsumed
      );
    }

    // Save to database
    try {
      await fetch("/api/meal-logger/log-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          meals: updatedMeals,
        }),
        credentials: "include",
      });

      toast.success("Meal removed successfully");
    } catch (error) {
      console.error("Error saving updated meals:", error);
      toast.error("Failed to remove meal");
    }
  };

  if (!userData) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Meal Logger</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Meal Logger</h1>

        {/* Date Selector */}
        <div className="mb-6">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Calorie Progress */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Calorie Tracking</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Daily Target</p>
              <p className="text-xl font-bold">
                {userData.caloricData.targetCalories} kcal
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Consumed</p>
              <p className="text-xl font-bold">{caloriesConsumed} kcal</p>
            </div>
            <div
              className={`p-4 rounded-lg text-center ${
                remainingCalories >= 0 ? "bg-yellow-50" : "bg-red-50"
              }`}
            >
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-xl font-bold">{remainingCalories} kcal</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  remainingCalories >= 0 ? "bg-green-500" : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (caloriesConsumed / userData.caloricData.targetCalories) *
                      100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Add Meal Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add a Meal</h2>

          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">
              Select from available meals
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="meal-select"
                  className="block text-sm font-medium text-gray-700"
                >
                  Choose a meal
                </label>
                <select
                  id="meal-select"
                  value={selectedMeal}
                  onChange={(e) => {
                    setSelectedMeal(e.target.value);
                    // Clear custom meal when selecting a predefined meal
                    if (e.target.value) {
                      setCustomMeal({ name: "", calories: "" });
                    }
                  }}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">-- Select a meal --</option>
                  {availableMeals.map((meal) => (
                    <option key={meal._id} value={meal._id}>
                      {meal.name} - {meal.totalCalories} kcal
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Or add a custom meal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="meal-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Meal Name
                  </label>
                  <input
                    type="text"
                    id="meal-name"
                    value={customMeal.name}
                    onChange={(e) => {
                      setCustomMeal({ ...customMeal, name: e.target.value });
                      // Clear selected meal when adding custom meal
                      if (e.target.value) {
                        setSelectedMeal("");
                      }
                    }}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="E.g., Breakfast Sandwich"
                  />
                </div>
                <div>
                  <label
                    htmlFor="meal-calories"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Calories
                  </label>
                  <input
                    type="number"
                    id="meal-calories"
                    value={customMeal.calories}
                    onChange={(e) => {
                      setCustomMeal({
                        ...customMeal,
                        calories: e.target.value,
                      });
                      // Clear selected meal when adding custom meal
                      if (e.target.value) {
                        setSelectedMeal("");
                      }
                    }}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="E.g., 500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddMeal}
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
            >
              Add Meal
            </button>
          </div>
        </div>

        {/* Meals List */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Meals</h2>

          {isLoading ? (
            <p>Loading meals...</p>
          ) : meals.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {meals.map((meal, index) => (
                <li
                  key={index}
                  className="py-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-medium">{meal.name}</h3>
                    <p className="text-gray-600">{meal.calories} kcal</p>
                    <p className="text-xs text-gray-500">
                      {meal.type === "predefined"
                        ? "From meal database"
                        : "Custom meal"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveMeal(index)}
                    className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center py-4 text-gray-500">
              No meals logged for this date. Add your first meal above!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
