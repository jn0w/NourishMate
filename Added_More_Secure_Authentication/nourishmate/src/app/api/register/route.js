import { MongoClient, ServerApiVersion } from "mongodb";
import bcrypt from "bcryptjs";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// POST request handler for user registration
export async function POST(request) {
  try {
    // Parse the request body to get user data
    const { name, email, password, address, phoneNumber } =
      await request.json();

    // Validate required fields
    if (!name || !email || !password || !address || !phoneNumber) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Hash the password using bcryptjs
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Connect to MongoDB
    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    // Check if the email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return new Response("Email is already registered", { status: 400 });
    }

    // Insert the new user into the MongoDB collection
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword, // Save the hashed password
      address,
      phoneNumber,
      createdAt: new Date(),
    });

    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        id: result.insertedId,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Failed to register user:", error);
    return new Response("Failed to register user", { status: 500 });
  } finally {
    // Close MongoDB client connection
    await client.close();
  }
}
