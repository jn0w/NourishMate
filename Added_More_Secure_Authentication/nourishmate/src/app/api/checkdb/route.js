import { MongoClient, ServerApiVersion } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Exporting the GET method for handling GET requests
export async function GET() {
  try {
    // Connect to MongoDB
    await client.connect();

    // Ping the database to check the connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged the database. You successfully connected to MongoDB!");

    // Return a success message for the browser to display
    return new Response("Connected to MongoDB successfully!", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);

    // Return an error message for the browser to display
    return new Response("Failed to connect to MongoDB", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  } finally {
    // Ensure the client is closed
    await client.close();
  }
}
