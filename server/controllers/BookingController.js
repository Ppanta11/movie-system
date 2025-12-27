import Show from "../models/Show.js";
import User from "../models/User.js";
import KhaltiService from "../services/khaltiService.js";
import { generatePaymentInformation } from "../utils/paymentUtils.js";

// Function to check availabilty of seleceted seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats;

    const ISAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);

    return !ISAnySeatTaken;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

export const createBooking = async (req, res) => {
  const khaltiService = KhaltiService();
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    //check seat availability

    const isAvailble = await checkSeatsAvailability(showId, selectedSeats);

    if (!isAvailble) {
      return res.json({
        success: false,
        message: "selected seats are not available",
      });
    }

    //get show details
    const showData = await Show.findById(showId).populate("movie");

    //creare new booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    selectedSeats.map((seat) => {
      showData.occupiedSeats[seat] = userId;
    });

    showData.markModified("occupiedSeats");
    await showData.save();

    const user = await User.findById(userId);

    //khalti gateway
    const paymentInformation = generatePaymentInformation({
      user: user,
      booking: booking,
      show: showData,
    });

    let khaltiUrl = "";

    try {
      const khaltiResult =
        await khaltiService.initiatePayment(paymentInformation);
      khaltiUrl = khaltiResult;
    } catch (e) {
      khaltiUrl = e;
    }
    res.json({
      success: true,
      message: "Booked Sucessfully",
      khaltiUrl: khaltiUrl,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);

    const occupiedSeats = Object.keys(showData.occupiedSeats || {});

    res.json({ success: true, occupiedSeats });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
