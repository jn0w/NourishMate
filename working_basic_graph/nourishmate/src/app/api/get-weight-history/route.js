import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function GET(req) {
  try {
    await client.connect();
    const db = client.db("testDatabase");
    const collection = db.collection("weight_entries");

    // ✅ Extract token from cookies
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("token=")) {
      console.error("No token found in cookies");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No token found" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const token = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      console.error("Token extraction failed");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Token missing" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("Invalid token:", err);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Corrected User ID extraction
    if (!decoded.id) {
      console.error("Decoded token missing 'id' field:", decoded);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token structure" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = new ObjectId(decoded.id); // Ensure ObjectId for MongoDB queries

    // ✅ Fetch weight entries for the user
    const weightEntries = await collection.find({ userId }).toArray();

    return new Response(JSON.stringify(weightEntries), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching weight history:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
