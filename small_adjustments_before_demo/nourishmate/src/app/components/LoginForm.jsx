"use client"; // its a client side component

import { useState } from "react"; // Import React useState for state management
import { useRouter } from "next/navigation"; // Import Next.js router for navigation

const LoginForm = () => {
  // State to hold form input values (email and password).
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // State to hold messages such as success or error messages.
  const [message, setMessage] = useState("");

  // Next.js router instance to handle navigation.
  const router = useRouter();

  // Handles input changes in the form fields.
  const handleChange = (e) => {
    const { name, value } = e.target; // Get the input name and value from the event.
    setFormData((prevData) => ({ ...prevData, [name]: value })); // Update the corresponding field in the formData state.
  };

  // Handles form submission.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior (page reload).

    try {
      // Make a POST request to the login API with the form data.
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set content type to JSON.
        },
        body: JSON.stringify(formData), // Convert formData object to a JSON string for the request body.
      });

      if (response.ok) {
        // If the response is successful:
        setMessage("Login successful! Redirecting..."); // Display a success message.

        // Redirect to the homepage after 2 seconds.
        setTimeout(() => {
          router.push("/"); // Navigate to the homepage.
        }, 2000);
      } else {
        // If the response indicates a failure:
        const errorData = await response.text(); // Extract the error message from the response.
        setMessage("Login failed: " + errorData); // Display the error message.
      }
    } catch (error) {
      // If there's an error during the fetch process:
      setMessage("Error: " + error.message); // Display the error message.
    }
  };

  return (
    <div>
      <h2>Login</h2> {/* Login form header */}
      <form onSubmit={handleSubmit}>
        {/* Email input field */}
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email} // input bound to formData state.
            onChange={handleChange} // Update state on input change.
            required // Make the field mandatory.
          />
        </div>
        {/* Password input field */}
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password} // input bound to formData state.
            onChange={handleChange} // Update state on input change.
            required // Make the field mandatory.
          />
        </div>
        {/* Submit button */}
        <button type="submit">Login</button>
      </form>
      {/* Display any message (success or error) */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoginForm; // Export the component as the default export.
