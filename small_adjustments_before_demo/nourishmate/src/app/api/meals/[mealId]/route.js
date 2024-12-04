import { MongoClient, ObjectId } from "mongodb";

// MongoDB connection URI and client initialization
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const dbName = "testDatabase";

// DELETE API to remove a meal from the database
export async function DELETE(request, { params }) {
  try {
    // Connect to the MongoDB client
    await client.connect();
    const db = client.db(dbName); // Access the specified database
    const collection = db.collection("meals"); // Access the 'meals' collection

    // Extract the meal ID from the request parameters
    const { mealId } = params;

    // Attempt to delete the meal with the specified ID
    const result = await collection.deleteOne({ _id: new ObjectId(mealId) });

    // Check if a meal was successfully deleted
    if (result.deletedCount === 1) {
      return new Response(
        JSON.stringify({ message: "Meal deleted successfully" }), // Success response
        { status: 200 }
      );
    } else {
      // Meal with the specified ID was not found
      return new Response(JSON.stringify({ message: "Meal not found" }), {
        status: 404,
      });
    }
  } catch (error) {
    // Handle any errors during the deletion process
    console.error("Error deleting meal:", error);
    return new Response(JSON.stringify({ message: "Failed to delete meal" }), {
      status: 500, // Internal server error
    });
  } finally {
    // close db connection after the operation
    await client.close();
  }
}
