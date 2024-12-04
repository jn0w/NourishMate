import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function GET(request) {
  // Extract query parameters from the request URL
  const { searchParams } = new URL(request.url);
  const goal = searchParams.get("goal"); // Retrieve the user's goal

  try {
    // Connect to the MongoDB client
    await client.connect();
    const db = client.db("testDatabase"); // Access the database
    const mealsCollection = db.collection("meals"); // Access the 'meals' collection

    // Query meals based on the user's goal (category matches the goal)
    const query = {
      category: goal, // Filter meals by category that matches the goal
    };

    // Fetch meals matching the query and convert to an array
    const meals = await mealsCollection.find(query).toArray();

    // Respond with the filtered meals in JSON format
    return new Response(JSON.stringify(meals), {
      status: 200, // Success status
      headers: { "Content-Type": "application/json" }, // Specify JSON content type
    });
  } catch (error) {
    // Handle errors during the fetch process
    console.error("Error fetching meals:", error); // Log the error for debugging
    return new Response("Error fetching meals", { status: 500 }); // Return a 500 status code for server error
  } finally {
    // Ensure the database connection is closed after the operation
    await client.close();
  }
}
