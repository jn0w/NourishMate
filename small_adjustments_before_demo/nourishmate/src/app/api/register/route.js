import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    // Extract the user data from the request body
    const { name, email, password, address, phoneNumber } =
      await request.json();

    // Validate that all required fields are provided
    if (!email || !password || !name) {
      return new Response("Missing required fields", { status: 400 }); // Return 400 if validation fails
    }

    // Connect to the database
    await client.connect();
    const db = client.db("testDatabase"); // Access the database
    const usersCollection = db.collection("userCollection"); // Access the user collection

    // Check if a user with the provided email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return new Response("User already exists", { status: 409 }); // Return 409 if the email is already registered
    }

    // Hash the user's password for secure storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the collection with a default role of "user"
    const result = await usersCollection.insertOne({
      name, // User's name
      email, // User's email
      password: hashedPassword, // Encrypted password
      address, // User's address
      phoneNumber, // User's phone number
      role: "user", // Assign a default role of "user"
      createdAt: new Date(), // Add a timestamp for when the user was created
    });

    // Return a success response with the new user's ID
    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        id: result.insertedId, // MongoDB ID of the newly created user
      }),
      { status: 201 } // Return 201 to indicate resource creation
    );
  } catch (error) {
    // Log and return a 500 error if any issues occur during the process
    console.error("Error registering user:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    // Ensure the database connection is closed after the operation
    await client.close();
  }
}
