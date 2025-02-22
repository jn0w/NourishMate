"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";

export default function BudgetTracker() {
  const [budgetAmount, setBudgetAmount] = useState(0);
  const [budgetType, setBudgetType] = useState(""); // weekly or monthly
  const [expenses, setExpenses] = useState([]);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // **Check if user is logged in**
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/check-auth", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
    }
  };

  // **Fetch budget data dynamically**
  const fetchBudget = async () => {
    try {
      const response = await fetch("/api/budget-tracker");
      if (response.ok) {
        const data = await response.json();
        setBudgetAmount(data.budgetAmount || 0);
        setBudgetType(data.budgetType || "");
        setExpenses(data.expenses || []);
        updateRemainingBudget(data.budgetAmount, data.expenses);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchBudget();
  }, []);

  // **Calculate Remaining Budget**
  const updateRemainingBudget = (budget, exp) => {
    const totalExpenses = exp.reduce((sum, expense) => sum + expense.amount, 0);
    setRemainingBudget(budget - totalExpenses);
  };

  // **Set Budget**
  const handleSetBudget = async () => {
    if (!user) {
      setMessage("You must be logged in to set a budget.");
      return;
    }
    if (!budgetAmount || !budgetType) {
      setMessage("Please enter a budget amount and select a type.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/budget-tracker/set-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgetAmount, budgetType }),
      });

      if (response.ok) {
        setMessage("Budget set successfully!");
        await fetchBudget();
      } else {
        setMessage("Failed to set budget.");
      }
    } catch (error) {
      console.error("Error setting budget:", error);
      setMessage("An error occurred.");
    }
    setIsLoading(false);
  };

  // **Add Expense**
  const handleAddExpense = async () => {
    if (!user) {
      setMessage("You must be logged in to add an expense.");
      return;
    }
    if (!expenseAmount || !expenseDescription) {
      setMessage("Please enter a valid expense and description.");
      return;
    }

    const newExpense = {
      amount: Number(expenseAmount),
      description: expenseDescription.trim(),
    };

    setIsLoading(true);
    try {
      const response = await fetch("/api/budget-tracker/add-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });

      if (response.ok) {
        setMessage("Expense added!");
        setExpenseAmount("");
        setExpenseDescription("");
        await fetchBudget();
      } else {
        const errorData = await response.json();
        console.error("Failed to add expense:", errorData);
        setMessage(`Failed to add expense: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      setMessage("An error occurred.");
    }
    setIsLoading(false);
  };

  // **Delete Expense**
  const handleDeleteExpense = async (id) => {
    if (!user) {
      setMessage("You must be logged in to delete an expense.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/budget-tracker/delete-expense?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setMessage("Expense removed!");
        await fetchBudget();
      } else {
        setMessage("Failed to delete expense.");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      setMessage("An error occurred.");
    }
    setIsLoading(false);
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h1>Budget Tracker</h1>

        {/* Budget Form */}
        <div>
          <h2>Set Your Budget</h2>
          <input
            type="number"
            placeholder="Budget Amount"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(Number(e.target.value))}
          />
          <select
            value={budgetType}
            onChange={(e) => setBudgetType(e.target.value)}
          >
            <option value="">Select Budget Type</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button onClick={handleSetBudget} disabled={isLoading}>
            {isLoading ? "Saving..." : "Set Budget"}
          </button>
        </div>

        {/* Budget Progress Bar (Slider Removed) */}
        {budgetAmount > 0 && (
          <div>
            <h2>Remaining Budget: ${remainingBudget}</h2>
            <progress
              value={remainingBudget}
              max={budgetAmount}
              style={{ width: "100%" }}
            ></progress>
          </div>
        )}

        {/* Expense Form */}
        <div>
          <h2>Add Expense</h2>
          <input
            type="number"
            placeholder="Expense Amount"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Expense Description"
            value={expenseDescription}
            onChange={(e) => setExpenseDescription(e.target.value)}
          />
          <button onClick={handleAddExpense} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Expense"}
          </button>
        </div>

        {/* Expense List */}
        {expenses.length > 0 && (
          <div>
            <h2>Expenses</h2>
            <ul>
              {expenses.map((expense) => (
                <li key={expense.id}>
                  {expense.description}: ${expense.amount}
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Deleting..." : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Message Display */}
        {message && <p style={{ color: user ? "green" : "red" }}>{message}</p>}
      </div>
    </>
  );
}
