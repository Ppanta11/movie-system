import Show from "../models/Show.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import KhaltiService from "../services/khaltiService.js";
import { generatePaymentInformation } from "../utils/paymentUtils.js";

// GET /api/bookings/my
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.auth?.userId; // <-- get userId from Clerk
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const bookings = await Booking.find({ user: userId }).populate({
      path: "show",
      populate: { path: "movie" }
    });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Error in getMyBookings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// Check if selected seats are available
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats || {};
    return !selectedSeats.some(seat => occupiedSeats[seat]);
  } catch (error) {
    console.error("Error in checkSeatsAvailability:", error.message);
    return false;
  }
};

export const createBooking = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    // Get user ID from auth middleware
    const userId = req.user?._id || (req.auth ? req.auth().userId : null);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    console.log("User ID:", userId);

    const { showId, selectedSeats } = req.body;
    if (!showId || !selectedSeats || selectedSeats.length === 0)
      return res.status(400).json({ success: false, message: "Show ID and seats are required" });
    console.log("Show ID:", showId, "Selected Seats:", selectedSeats);

    // Get show data
    const showData = await Show.findById(showId).populate("movie");
    if (!showData) return res.status(404).json({ success: false, message: "Show not found" });
    console.log("Show data found");

    // Check seat availability
    showData.occupiedSeats = showData.occupiedSeats || {};
    const isAvailable = !selectedSeats.some(seat => showData.occupiedSeats[seat]);
    if (!isAvailable)
      return res.json({ success: false, message: "Selected seats are not available" });
    console.log("Seats available");

    // Create booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });
    console.log("Booking created:", booking._id);

    // Update show occupied seats
    selectedSeats.forEach(seat => (showData.occupiedSeats[seat] = userId));
    showData.markModified("occupiedSeats");
    await showData.save();
    console.log("Show updated with booked seats");

    // Optional: initiate Khalti payment
    const khaltiService = new KhaltiService();
    let khaltiUrl = "";
    try {
      const user = await User.findById(userId);
      khaltiUrl = await khaltiService.initiatePayment(
        generatePaymentInformation({ user, booking, show: showData })
      );
    } catch (e) {
      khaltiUrl = e;
    }

    res.json({ success: true, message: "Booked Successfully", khaltiUrl });
  } catch (error) {
    console.error("Error in createBooking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);
    if (!showData) return res.status(404).json({ success: false, message: "Show not found" });

    const occupiedSeats = Object.keys(showData.occupiedSeats || {});
    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.error("Error in getOccupiedSeats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
