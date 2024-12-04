import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// GET API: Fetch all meals from the database
export async function GET(req) {
  try {
    // Connect to the MongoDB client
    await client.connect();
    const db = client.db("testDatabase"); // Access the specified database
    const mealsCollection = db.collection("meals"); // Access the 'meals' collection

    // Fetch all meals from the collection and convert them to an array
    const meals = await mealsCollection.find().toArray();

    // Respond with the fetched meals in JSON format
    return new Response(JSON.stringify(meals), {
      headers: { "Content-Type": "application/json" }, // Specify JSON content type
      status: 200, // Status code for successful response
    });
  } catch (error) {
    // Handle any errors during the fetch process
    console.error("Error fetching meals:", error);
    return new Response("Failed to fetch meals", { status: 500 }); // Return a 500 status code for server error
  } finally {
    // Ensure the database connection is closed after the operation
    await client.close();
  }
}

// POST API: Add a new meal to the database
export async function POST(req) {
  try {
    // Parse the meal data from the request body
    const mealData = await req.json();

    // Connect to the MongoDB client
    await client.connect();
    const db = client.db("testDatabase"); // Access the specified database
    const mealsCollection = db.collection("meals"); // Access the 'meals' collection

    // Insert the new meal into the collection
    const result = await mealsCollection.insertOne(mealData);

    // Respond with the ID of the newly added meal
    return new Response(JSON.stringify({ mealId: result.insertedId }), {
      headers: { "Content-Type": "application/json" }, // Specify JSON content type
      status: 201, // Status code for successful creation
    });
  } catch (error) {
    // Handle any errors during the addition process
    console.error("Error adding meal:", error);
    return new Response("Failed to add meal", { status: 500 }); // Return a 500 status code for server error
  } finally {
    // Ensure the database connection is closed after the operation
    await client.close();
  }
}
