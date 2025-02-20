"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Update the import here

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: "",
  });
  const [message, setMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter(); // Using `next/navigation` router

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("User " + formData.name + " registered successfully!");
        setIsRegistered(true);
      } else {
        const errorData = await response.text();
        setMessage("Error: " + errorData);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  const goToHome = () => {
    router.push("/"); // Client-side navigation
  };

  return (
    <div>
      <h2>Register</h2>
      {!isRegistered ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Phone Number:</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Register</button>
        </form>
      ) : (
        <div>
          <p>{message}</p>
          <button onClick={goToHome}>Go Back to Home</button>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
