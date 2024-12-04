import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// POST API to add a new meal to the database
export async function POST(request) {
  try {
    // Parse the meal data from the request body
    const mealData = await request.json();

    // Connect to the MongoDB client
    await client.connect();
    const db = client.db("testDatabase"); // Access the specified database
    const mealsCollection = db.collection("meals"); // Access the 'meals' collection

    // Insert the meal data into the collection
    const result = await mealsCollection.insertOne(mealData);

    // Respond with success message and the ID of the newly added meal
    return new Response(
      JSON.stringify({
        message: "Meal added successfully", // Success message
        mealId: result.insertedId, // Return the ID of the inserted document
      }),
      { status: 201 } // Status code for successful creation
    );
  } catch (error) {
    // Handle any errors during the meal addition process
    console.error("Error adding meal:", error);
    return new Response("Internal Server Error", { status: 500 }); // Return a 500 status code for server error
  } finally {
    // Ensure the database connection is closed after the operation
    await client.close();
  }
}
