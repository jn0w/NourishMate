// src/app/page.js
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./globals.css";
import Navbar from "./components/Navbar";
import toast, { Toaster } from "react-hot-toast";

function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [meals, setMeals] = useState([]);
  const [currentMealIndex, setCurrentMealIndex] = useState(0);
  const [stats, setStats] = useState({
    users: 1250,
    meals: 300,
    achievements: 15,
  });
  const router = useRouter();

  // Features data
  const features = [
    {
      icon: "🍽️",
      title: "Meal Tracking",
      description:
        "Log your daily meals and track calories consumed against your personal target.",
    },
    {
      icon: "📊",
      title: "Calorie Calculator",
      description:
        "Calculate your BMR, TDEE, and daily caloric needs based on your personal details and goals.",
    },
    {
      icon: "💰",
      title: "Budget Management",
      description:
        "Set weekly or monthly food budgets and track expenses to stay within your financial goals.",
    },
    {
      icon: "🏆",
      title: "Achievement System",
      description:
        "Earn badges and trophies as you maintain your streak and reach important health milestones.",
    },
  ];

  // Steps data
  const steps = [
    {
      number: "01",
      title: "Set Your Calories",
      description:
        "Calculate your daily caloric needs based on your gender, weight, height, age, and activity level. Choose your goal (weight loss, maintenance, or muscle gain).",
      link: "/calorie-calculator",
      linkText: "Calculate Calories",
      image: "/calories.png",
    },
    {
      number: "02",
      title: "Set Your Budget",
      description:
        "Enter your budget type (weekly or monthly) and the total amount. This helps us recommend meals that not only meet your caloric needs but also fit your financial plan.",
      link: "/budget-tracker",
      linkText: "Set Budget",
      image: "/Budget.jpg",
    },
    {
      number: "03",
      title: "Get Personalized Meals",
      description:
        "Explore meal options tailored to your caloric needs and budget. Add favorites for easy access and track your meals daily to maintain your health journey.",
      link: "/personalizedMeals",
      linkText: "Explore Meals",
      image: "/mealPlan.png",
    },
    {
      number: "04",
      title: "Track Daily Progress",
      description:
        "Use the meal logger to record what you eat each day. Monitor your calorie intake, maintain your streak, and earn achievements as you progress.",
      link: "",
      linkText: "Log Meals",
      image: "/tracking.png",
    },
  ];

  // Check login status
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch("/api/check-auth");
        if (res.ok) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Fetch meals for carousel
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
        toast.error("Failed to load meals showcase");
      }
    };

    fetchMeals();
  }, []);

  // Carousel auto-rotation
  useEffect(() => {
    if (meals.length === 0) return;

    const interval = setInterval(() => {
      setCurrentMealIndex((prevIndex) => (prevIndex + 1) % meals.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [meals.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-20 md:py-32">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-600/90 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Your Personal Nutrition{" "}
                <span className="text-yellow-300">& Budget</span> Assistant
              </h1>
              <p className="text-blue-100 text-lg mb-8 max-w-md">
                NourishMate helps you track calories, manage your meal budget,
                and achieve your health goals with personalized meal
                recommendations.
              </p>
              <div className="flex flex-wrap gap-4">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/meal-logger"
                      className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium shadow-md transition duration-200"
                    >
                      Track Your Meals
                    </Link>
                    <Link
                      href="/account"
                      className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-lg font-medium transition duration-200"
                    >
                      View Account
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium shadow-md transition duration-200"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/login"
                      className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-lg font-medium transition duration-200"
                    >
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative w-full max-w-lg h-80 md:h-96">
                {meals.length > 0 && (
                  <div className="relative w-full h-full bg-white rounded-lg shadow-xl overflow-hidden p-4">
                    <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured Meal
                    </div>
                    <div className="relative h-3/5 overflow-hidden rounded-t-lg">
                      <img
                        src={
                          meals[currentMealIndex].image || "/default-image.png"
                        }
                        alt={meals[currentMealIndex].name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {meals[currentMealIndex].name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-green-600 font-medium">
                          {meals[currentMealIndex].totalCalories} kcal
                        </span>
                        <span className="text-blue-600 font-medium">
                          €
                          {meals[currentMealIndex].estimatedCost?.toFixed(2) ||
                            0}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <button
                          onClick={() =>
                            setCurrentMealIndex((prevIndex) =>
                              prevIndex === 0 ? meals.length - 1 : prevIndex - 1
                            )
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Previous
                        </button>
                        <Link
                          href="/exploreMeals"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View All →
                        </Link>
                        <button
                          onClick={() =>
                            setCurrentMealIndex(
                              (prevIndex) => (prevIndex + 1) % meals.length
                            )
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              NourishMate provides everything you need to maintain a healthy
              lifestyle while staying within your budget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How NourishMate Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to get the most out of your NourishMate
              experience
            </p>
          </div>

          <div className="space-y-12 md:space-y-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-center ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`md:col-span-5 ${
                    index % 2 === 1 ? "md:order-2" : ""
                  }`}
                >
                  <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
                    <div className="absolute top-0 left-0 bg-blue-600 text-white text-lg font-bold px-4 py-2 rounded-br-lg z-10">
                      {step.number}
                    </div>
                    <img
                      src={step.image || "/placeholder-image.jpg"}
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div
                  className={`md:col-span-7 ${
                    index % 2 === 1 ? "md:order-1" : ""
                  }`}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{step.description}</p>
                  <Link
                    href={step.link}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {step.linkText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start your health journey?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join NourishMate today and take control of your nutrition, budget,
            and wellness goals with our personalized approach.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/meal-logger"
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-lg font-medium shadow-md transition duration-200"
              >
                Start Logging Your Meals
              </Link>
            ) : (
              <Link
                href="/register"
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-lg font-medium shadow-md transition duration-200"
              >
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">NourishMate</h3>
              <p className="text-gray-400">
                Your personal nutrition and budget assistant for a healthier
                lifestyle.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/meal-logger" className="hover:text-white">
                    Meal Logging
                  </Link>
                </li>
                <li>
                  <Link href="/calorie-calculator" className="hover:text-white">
                    Calorie Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/budget-tracker" className="hover:text-white">
                    Budget Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/personalizedMeals" className="hover:text-white">
                    Meal Recommendations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} NourishMate. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      <Toaster position="top-right" />
    </div>
  );
}

export default HomePage;
