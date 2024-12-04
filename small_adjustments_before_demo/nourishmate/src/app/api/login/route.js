import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing comparison
import jwt from "jsonwebtoken"; // Import JWT for token generation

// MongoDB connection URI and client setup
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Secret key for JWT signing
const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";

export async function POST(request) {
  try {
    // Parse the email and password from the incoming request body
    const { email, password } = await request.json();
    console.log("Received login request:", { email }); // Debugging log

    // Check if email and password are provided
    if (!email || !password) {
      console.log("Missing email or password"); // Debugging log
      return new Response("Missing email or password", { status: 400 }); // Respond with Bad Request
    }

    // Connect to the MongoDB database
    await client.connect();
    console.log("Connected to database"); // Debugging log

    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    // Find the user document by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      console.log("User not found"); // Debugging log
      return new Response("User not found", { status: 404 }); // Respond with Not Found
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Incorrect password"); // Debugging log
      return new Response("Incorrect password", { status: 401 }); // Respond with Unauthorized
    }

    // Determine if the user has an admin role
    const isAdmin = user.role === "admin";
    console.log("User role:", user.role); // Debugging log
    console.log("isAdmin set to:", isAdmin); // Debugging log

    // Retrieve additional user fields for personalization
    const activityLevel = user.activityLevel || "Not specified";
    const goal = user.goal || "Not specified";

    // Generate a JWT token with user data and additional fields
    const token = jwt.sign(
      {
        id: user._id, // User ID
        name: user.name, // User name
        email: user.email, // User email
        address: user.address, // User address
        phoneNumber: user.phoneNumber, // User phone number
        isAdmin: isAdmin, // Admin status
        activityLevel: activityLevel, // Activity level for meal personalization
        goal: goal, // Goal for meal personalization
      },
      JWT_SECRET, // Signing key
      {
        expiresIn: "1h", // Token expiration time
      }
    );

    console.log("Token generated:", token); // Debugging log for token

    // Set the JWT as an HTTP-only cookie for secure transmission
    return new Response(JSON.stringify({ message: "Login successful" }), {
      status: 200, // Success response
      headers: {
        "Content-Type": "application/json", // Specify JSON response type
        "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=3600;`, // Set cookie with token (1 hour lifespan)
      },
    });
  } catch (error) {
    console.error("Error logging in:", error); // Debugging log for any errors
    return new Response("Internal Server Error", { status: 500 }); // Respond with Internal Server Error
  } finally {
    console.log("Closing database connection"); // Debugging log for connection closure
    await client.close(); // Ensure database connection is closed
  }
}
