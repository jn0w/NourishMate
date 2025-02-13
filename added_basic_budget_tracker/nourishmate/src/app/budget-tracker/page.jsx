"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function BudgetTracker() {
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetType, setBudgetType] = useState(""); // Weekly or Monthly
  const [expenses, setExpenses] = useState([]);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [message, setMessage] = useState("");

  // Fetch user's budget data on page load
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const response = await fetch("/api/budget-tracker");
        if (response.ok) {
          const data = await response.json();
          setBudgetAmount(data.budgetAmount || "");
          setBudgetType(data.budgetType || "");
          setExpenses(data.expenses || []);
          updateRemainingBudget(data.budgetAmount, data.expenses);
        }
      } catch (error) {
        console.error("Error fetching budget data:", error);
      }
    };

    fetchBudget();
  }, []);

  // Update remaining budget calculation
  const updateRemainingBudget = (budget, exp) => {
    const totalExpenses = exp.reduce((sum, expense) => sum + expense.amount, 0);
    setRemainingBudget(budget - totalExpenses);
  };

  // Set or update budget (FIXED API ROUTE)
  const handleSetBudget = async () => {
    if (!budgetAmount || !budgetType) {
      setMessage("Please enter a budget amount and select a type.");
      return;
    }

    try {
      const response = await fetch("/api/budget-tracker/set-budget", {
        method: "POST", //  Corrected from PUT to POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgetAmount, budgetType }),
      });

      if (response.ok) {
        setMessage("Budget set successfully!");
        setExpenses([]); // Reset expenses when setting a new budget
        setRemainingBudget(budgetAmount);
      } else {
        setMessage("Failed to set budget.");
      }
    } catch (error) {
      console.error("Error setting budget:", error);
      setMessage("An error occurred.");
    }
  };

  //  Updated to match backend API correctly
  const handleAddExpense = async () => {
    if (!expenseAmount || !expenseDescription) {
      setMessage("Please enter a valid expense and description.");
      return;
    }

    const newExpense = {
      amount: Number(expenseAmount), //  Ensure it's a number
      description: expenseDescription,
    };

    try {
      const response = await fetch("/api/budget-tracker/add-expense", {
        method: "POST", //  Ensure using POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });

      if (response.ok) {
        const updatedExpenses = [...expenses, newExpense];
        setExpenses(updatedExpenses);
        updateRemainingBudget(budgetAmount, updatedExpenses);
        setMessage("Expense added!");
        setExpenseAmount("");
        setExpenseDescription("");
      } else {
        const errorData = await response.json();
        setMessage(`Failed to add expense: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      setMessage("An error occurred.");
    }
  };

  // Delete an expense ( FIXED API ROUTE)
  const handleDeleteExpense = async (id) => {
    try {
      const response = await fetch(
        `/api/budget-tracker/delete-expense?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const updatedExpenses = expenses.filter((expense) => expense.id !== id);
        setExpenses(updatedExpenses);
        updateRemainingBudget(budgetAmount, updatedExpenses);
        setMessage("Expense removed!");
      } else {
        setMessage("Failed to delete expense.");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      setMessage("An error occurred.");
    }
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
            onChange={(e) => setBudgetAmount(e.target.value)}
          />
          <select
            value={budgetType}
            onChange={(e) => setBudgetType(e.target.value)}
          >
            <option value="">Select Budget Type</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button onClick={handleSetBudget}>Set Budget</button>
        </div>

        {/* Budget Progress */}
        {budgetAmount > 0 && (
          <div>
            <h2>Remaining Budget: ${remainingBudget}</h2>
            <progress
              value={Math.max(0, remainingBudget)} // Prevents the bar from going negative
              max={budgetAmount}
              style={{ width: "100%" }}
            ></progress>

            {/* Warning Message if Over Budget */}
            {remainingBudget < 0 && (
              <p style={{ color: "red", fontWeight: "bold" }}>
                🚨 Warning: You've exceeded your budget! Consider reviewing your
                expenses. 🚨
              </p>
            )}
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
          <button onClick={handleAddExpense}>Add Expense</button>
        </div>

        {/* Expense List */}
        {expenses.length > 0 && (
          <div>
            <h2>Expenses</h2>
            <ul>
              {expenses.map((expense, index) => (
                <li key={index}>
                  {expense.description}: ${expense.amount}
                  <button onClick={() => handleDeleteExpense(expense.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Message Display */}
        {message && <p style={{ color: "green" }}>{message}</p>}
      </div>
    </>
  );
}
