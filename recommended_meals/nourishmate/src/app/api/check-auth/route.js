import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function GET(request) {
  const cookieHeader = request.headers.get("cookie");
  console.log("Cookie Header:", cookieHeader); // Debugging log for cookie header

  if (!cookieHeader) {
    console.log("No cookie header found");
    return new Response(JSON.stringify({ message: "No token found" }), {
      status: 401,
    });
  }

  const token = cookieHeader.split("token=")[1];
  console.log("Extracted Token:", token); // Debugging log for extracted token

  if (!token) {
    console.log("No token found in cookie header");
    return new Response(JSON.stringify({ message: "No token found" }), {
      status: 401,
    });
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decodedToken); // Debugging log for decoded token

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    // Fetch user data including activityLevel and goal from the database
    const user = await usersCollection.findOne(
      { _id: new ObjectId(decodedToken.id) },
      { projection: { activityLevel: 1, goal: 1 } }
    );

    // Merge the decoded token data with additional user fields
    return new Response(
      JSON.stringify({
        ...decodedToken,
        activityLevel: user?.activityLevel || "Not specified",
        goal: user?.goal || "Not specified",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Token verification failed:", error);
    return new Response(JSON.stringify({ message: "Invalid token" }), {
      status: 401,
    });
  } finally {
    await client.close();
  }
}
