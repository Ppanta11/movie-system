import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { createBooking, getOccupiedSeats, getMyBookings } from "../controllers/BookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", authMiddleware, createBooking); // create booking
bookingRouter.get("/my", authMiddleware, getMyBookings);      // get logged-in user bookings
bookingRouter.get("/seats/:showId", getOccupiedSeats);

export default bookingRouter;
