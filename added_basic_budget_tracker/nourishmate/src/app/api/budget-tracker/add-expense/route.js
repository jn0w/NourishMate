import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function getUserIdFromToken(request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const token = cookieHeader.split("token=")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const { amount, description } = await request.json();

    //  Ensure amount and description are valid
    if (!amount || !description) {
      return new Response(
        JSON.stringify({ message: "Missing expense details" }),
        {
          status: 400,
        }
      );
    }

    const newExpense = {
      id: new ObjectId(), //  Unique expense ID
      amount: Number(amount), // Ensure it's a number
      description,
      date: new Date(),
    };

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { "budgetData.expenses": newExpense } }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Failed to add expense" }),
        {
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Expense added successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error adding expense:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}
