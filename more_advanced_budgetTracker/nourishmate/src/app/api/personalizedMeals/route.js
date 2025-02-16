import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const goal = searchParams.get("goal");

  try {
    await client.connect();
    const db = client.db("testDatabase");
    const mealsCollection = db.collection("meals");

    const query = {
      category: goal, // Use goal directly for filtering
    };

    const meals = await mealsCollection.find(query).toArray();
    return new Response(JSON.stringify(meals), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching meals:", error);
    return new Response("Error fetching meals", { status: 500 });
  } finally {
    await client.close();
  }
}
