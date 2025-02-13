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
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { budgetAmount, budgetType } = await request.json();
    if (!budgetAmount || !budgetType)
      return new Response("Missing budget details", { status: 400 });

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          budgetData: {
            budgetAmount,
            budgetType,
            expenses: [],
          },
        },
      },
      { upsert: true }
    );

    return new Response(
      JSON.stringify({ message: "Budget saved successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving budget:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await client.close();
  }
}
