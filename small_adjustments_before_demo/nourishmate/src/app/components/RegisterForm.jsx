"use client"; // client side component

import { useState } from "react"; // Import the useState hook for managing component state
import { useRouter } from "next/navigation"; // Import the Next.js router for client-side navigation

const RegisterForm = () => {
  // State to store form data for registration.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: "",
  });

  const [message, setMessage] = useState(""); // State for storing feedback messages.
  const [isRegistered, setIsRegistered] = useState(false); // Tracks if the user has successfully registered.
  const router = useRouter(); // Router for client-side navigation.

  // Function to handle input changes and update form data.
  const handleChange = (e) => {
    const { name, value } = e.target; // Extract name and value from the input field.
    setFormData((prevData) => ({ ...prevData, [name]: value })); // Update the corresponding field in formData.
  };

  // Function to handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior.

    try {
      const response = await fetch("/api/register", {
        method: "POST", // HTTP POST method for submitting data to the server.
        headers: {
          "Content-Type": "application/json", // Specify the content type as JSON.
        },
        body: JSON.stringify(formData), // Send the form data as a JSON string.
      });

      if (response.ok) {
        // If the server responds with a success status.
        const data = await response.json(); // Parse the response JSON.
        setMessage("User " + formData.name + " registered successfully!"); // Display a success message.
        setIsRegistered(true); // Set the registration status to true.
      } else {
        // If the server responds with an error status.
        const errorData = await response.text(); // Extract the error message.
        setMessage("Error: " + errorData); // Display the error message.
      }
    } catch (error) {
      // Handle any network or other errors.
      setMessage("Error: " + error.message); // Display the error message.
    }
  };

  // Function to navigate to the home page after registration.
  const goToHome = () => {
    router.push("/"); // Navigate to the home page.
  };

  return (
    <div>
      <h2>Register</h2>
      {!isRegistered ? ( // Render the registration form if the user is not registered.
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange} // Handle input changes.
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange} // Handle input changes.
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange} // Handle input changes.
              required
            />
          </div>
          <div>
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange} // Handle input changes.
              required
            />
          </div>
          <div>
            <label>Phone Number:</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange} // Handle input changes.
              required
            />
          </div>
          <button type="submit">Register</button>{" "}
          {/* Submit button for the form */}
        </form>
      ) : (
        <div>
          <p>{message}</p> {/* Display the registration success message */}
          <button onClick={goToHome}>Go Back to Home</button>{" "}
          {/* Button to navigate to the home page */}
        </div>
      )}
    </div>
  );
};

export default RegisterForm; // Export the RegisterForm component for use in other parts of the app.
