// src/app/api/login/route.js
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// POST request handler for login
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate email and password fields
    if (!email || !password) {
      return new Response("Missing email or password", { status: 400 });
    }

    // Connect to MongoDB
    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    // Find the user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Compare the submitted password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response("Incorrect password", { status: 401 });
    }

    // Success: return a success message (or a token if you're using JWT)
    return new Response(JSON.stringify({ message: "Login successful" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await client.close();
  }
}
