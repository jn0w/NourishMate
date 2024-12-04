import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri); // Initialize the MongoDB client

// Secret key for JWT verification
const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";

// POST method to handle saving user data
export async function POST(request) {
  try {
    // Parse activityLevel and goal from the request body
    const { activityLevel, goal } = await request.json();

    // Retrieve the token from cookies
    const cookieHeader = request.headers.get("cookie"); // Get the "cookie" header from the request
    const token = cookieHeader?.split("token=")[1]; // Extract the token from the cookie
    if (!token) return new Response("Unauthorized", { status: 401 }); // If no token, respond with 401 Unauthorized

    // Verify the JWT and extract the user ID
    const decoded = jwt.verify(token, JWT_SECRET); // Decode the token using the secret
    const userId = decoded.id; // Get the user ID from the decoded token

    // Connect to the MongoDB database
    await client.connect();
    const db = client.db("testDatabase"); // Select the database
    const usersCollection = db.collection("userCollection"); // Access the user collection

    // Update the user's document with the new activityLevel and goal
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) }, // Find the document with the matching user ID
      { $set: { activityLevel, goal } } // Update the activityLevel and goal fields
    );

    // Respond with a success message
    return new Response(
      JSON.stringify({ message: "Data saved successfully" }),
      {
        status: 200, // HTTP status code 200 for success
        headers: { "Content-Type": "application/json" }, // Set response headers
      }
    );
  } catch (error) {
    // Handle any errors that occur
    console.error("Error updating user data:", error); // Log the error for debugging
    return new Response("Internal Server Error", { status: 500 }); // Respond with 500 Internal Server Error
  } finally {
    // Ensure the database connection is closed
    await client.close(); // Close the MongoDB client
  }
}
