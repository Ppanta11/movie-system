import { requireAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";

// Create the requireAuth middleware
export const authMiddleware = requireAuth(); // <-- export this for normal user routes

// Protect admin routes
export const protectAdmin = [
  authMiddleware,
  async (req, res, next) => {
    try {
      if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const user = await clerkClient.users.getUser(req.auth.userId);

      if (user.publicMetadata?.role !== "admin") {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  }
];
