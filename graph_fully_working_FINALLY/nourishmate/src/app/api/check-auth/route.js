import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    console.log("Cookie Header:", cookieHeader); // Debugging log

    if (!cookieHeader || !cookieHeader.includes("token=")) {
      console.log("No token found in cookie header");
      return new Response(
        JSON.stringify({ message: "Unauthorized - No token found" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ More robust token extraction method
    const match = cookieHeader.match(/token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      console.log("Token extraction failed");
      return new Response(
        JSON.stringify({ message: "Unauthorized - Token missing" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify the token
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decodedToken); // Debugging log

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    // ✅ Fetch user data including role, activityLevel, goal, and caloricData
    const user = await usersCollection.findOne(
      { _id: new ObjectId(decodedToken.id) },
      { projection: { role: 1, activityLevel: 1, goal: 1, caloricData: 1 } }
    );

    if (!user) {
      console.log("User not found in database");
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Determine if the user is an admin based on their role
    const isAdmin = user.role === "admin";

    return new Response(
      JSON.stringify({
        user: {
          id: decodedToken.id,
          name: decodedToken.name,
          email: decodedToken.email,
          isAdmin: isAdmin, // ✅ Now correctly set from DB
          activityLevel: user.activityLevel || "Not specified",
          goal: user.goal || "Not specified",
          caloricData: user.caloricData || null, // Include caloricData
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Token verification failed:", error);
    return new Response(
      JSON.stringify({ message: "Unauthorized - Invalid token" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await client.close();
  }
}
