import jwt from "jsonwebtoken";

// Secret key for verifying JWT tokens
const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";

export async function GET(request) {
  // Retrieve the cookie header from the incoming request
  const cookieHeader = request.headers.get("cookie");
  console.log("Cookie Header:", cookieHeader); // Debugging log for cookie header

  // If no cookie header is found, respond with an error message
  if (!cookieHeader) {
    console.log("No cookie header found");
    return new Response(JSON.stringify({ message: "No token found" }), {
      status: 401, // Unauthorized status code
    });
  }

  // Extract the token from the cookie header
  const token = cookieHeader.split("token=")[1];
  console.log("Extracted Token:", token); // Debugging log for extracted token

  // If no token is found in the cookie, respond with an error message
  if (!token) {
    console.log("No token found in cookie header");
    return new Response(JSON.stringify({ message: "No token found" }), {
      status: 401, // Unauthorized status code
    });
  }

  try {
    // Verify the extracted JWT token using the secret key
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decodedToken); // Debugging log for the decoded token

    // Respond with the decoded token and additional fields
    return new Response(
      JSON.stringify({
        ...decodedToken, // Spread the decoded token data
        isAdmin: decodedToken.isAdmin, // Include the isAdmin field for role-based logic
        activityLevel: decodedToken.activityLevel || "Not specified", // Include the activity level
        goal: decodedToken.goal || "Not specified", // Include the user's goal
      }),
      {
        status: 200, // Success status code
        headers: { "Content-Type": "application/json" }, // JSON response header
      }
    );
  } catch (error) {
    console.error("Token verification failed:", error); // Log any verification errors
    return new Response(JSON.stringify({ message: "Invalid token" }), {
      status: 401, // Unauthorized status code
    });
  }
}
