import jwt from "jsonwebtoken";

// Define a secret key for JWT token verification
const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";

// Define an async GET function to handle requests
export async function GET(request) {
  // Retrieve the cookie header from the request
  const cookieHeader = request.headers.get("cookie");

  // If there is no cookie header, return a 401 Unauthorized response with an error message
  if (!cookieHeader) {
    return new Response(JSON.stringify({ message: "No token found" }), {
      status: 401,
    });
  }

  // Extract the token value from the cookie header
  const token = cookieHeader.split("token=")[1];

  // If the token is not found in the cookie header, return a 401 Unauthorized response with an error message
  if (!token) {
    return new Response(JSON.stringify({ message: "No token found" }), {
      status: 401,
    });
  }

  try {
    // Verify the token using the secret key
    const decodedToken = jwt.verify(token, JWT_SECRET);

    // If verification is successful, return the decoded token data with a 200 OK status
    return new Response(JSON.stringify(decodedToken), { status: 200 });
  } catch (error) {
    // If verification fails, return a 401 Unauthorized response with an error message
    return new Response(JSON.stringify({ message: "Invalid token" }), {
      status: 401,
    });
  }
}
