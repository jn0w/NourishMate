import jwt from "jsonwebtoken";

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";

export async function GET(request) {
  const cookieHeader = request.headers.get("cookie");
  console.log("Cookie Header:", cookieHeader); // Debugging

  if (!cookieHeader) {
    return new Response(JSON.stringify({ message: "No token found" }), {
      status: 401,
    });
  }

  const token = cookieHeader.split("token=")[1];
  console.log("Token:", token); // Debugging

  if (!token) {
    return new Response(JSON.stringify({ message: "No token found" }), {
      status: 401,
    });
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decodedToken); // Debugging

    // Check if the user is an admin
    if (decodedToken.role === "admin") {
      return new Response(JSON.stringify({ ...decodedToken, isAdmin: true }), {
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ ...decodedToken, isAdmin: false }), {
        status: 200,
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid token" }), {
      status: 401,
    });
  }
}
