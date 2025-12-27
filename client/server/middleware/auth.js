// middleware/auth.js
import { clerkClient } from "@clerk/clerk-sdk-node";

export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token" });
    }

    const token = authHeader.split(" ")[1];

    // Verify Clerk token
    const session = await clerkClient.sessions.verifySessionToken(token);
    const userId = session.userId;
    const user = await clerkClient.users.getUser(userId);

    // Check public metadata role
    if (user.publicMetadata?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    req.user = user; 
    next();

  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
