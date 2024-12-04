import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";

// Secret key used for signing and verifying JWTs
const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";

// MongoDB connection URI
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri); // Initialize a new MongoDB client

// Main GET request handler
export async function GET(request) {
  // Retrieve the "cookie" header from the incoming request
  const cookieHeader = request.headers.get("cookie");
  console.log("Cookie Header:", cookieHeader); // Debugging log for the cookie header value

  // Check if the "cookie" header is present
  if (!cookieHeader) {
    console.log("No cookie header found"); // Log missing cookie header
    return new Response(JSON.stringify({ message: "No token found" }), {
      status: 401, // Return a 401 Unauthorized response
    });
  }

  // Extract the JWT token from the cookie header
  const token = cookieHeader.split("token=")[1];
  console.log("Extracted Token:", token); // Debugging log for the extracted token

  // Check if the token was successfully extracted
  if (!token) {
    console.log("No token found in cookie header"); // Log missing token
    return new Response(JSON.stringify({ message: "No token found" }), {
      status: 401, // Return a 401 Unauthorized response
    });
  }

  try {
    // Verify the extracted JWT token using the secret key
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decodedToken); // Debugging log for the decoded token

    // Connect to the MongoDB database
    await client.connect();
    const db = client.db("testDatabase"); // Access the "testDatabase"
    const usersCollection = db.collection("userCollection"); // Access the "userCollection"

    // Fetch user data (activityLevel and goal) based on the decoded token's user ID
    const user = await usersCollection.findOne(
      { _id: new ObjectId(decodedToken.id) },
      { projection: { activityLevel: 1, goal: 1 } } // Retrieve only activityLevel and goal fields
    );

    // Merge decoded token data with additional user fields and send as the response
    return new Response(
      JSON.stringify({
        ...decodedToken, // Include data from the decoded token
        activityLevel: user?.activityLevel || "Not specified", // Add activity level or default value
        goal: user?.goal || "Not specified", // Add user goal or default value
      }),
      {
        status: 200, // Return a 200 OK response
        headers: { "Content-Type": "application/json" }, // Set JSON response headers
      }
    );
  } catch (error) {
    // Handle errors during token verification or database access
    console.error("Token verification failed:", error);
    return new Response(JSON.stringify({ message: "Invalid token" }), {
      status: 401, // Return a 401 Unauthorized response for invalid token
    });
  } finally {
    // Ensure the MongoDB client is closed after the operation
    await client.close();
  }
}
