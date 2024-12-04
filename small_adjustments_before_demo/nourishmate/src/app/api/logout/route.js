export async function POST(request) {
  // This API endpoint handles user logout by clearing the authentication token

  return new Response(
    JSON.stringify({ message: "Logged out successfully" }), // Response message to confirm logout
    {
      status: 200, // HTTP status code indicating success
      headers: {
        "Content-Type": "application/json", // Response content type set to JSON
        "Set-Cookie": `token=; HttpOnly; Path=/; Max-Age=0;`,
        // Clear the authentication token:
        // - Sets the cookie named 'token' with an empty value
        // - HttpOnly ensures the cookie is not accessible via client-side JavaScript
        // - Path=/ ensures the cookie applies to the entire site
        // - Max-Age=0 makes the cookie expire immediately, effectively clearing it
      },
    }
  );
}
