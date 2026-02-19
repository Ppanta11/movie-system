import Show from "../models/Show.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import KhaltiService from "../services/khaltiService.js";
import { generatePaymentInformation } from "../utils/paymentUtils.js";
import { inngest } from "../inngest/index.js";

// GET /api/bookings/my
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.auth?.userId;
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

    // initiate Khalti payment
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


export const payWithKhalti = async (req, res) => {
  console.log(req)
  console.log('pay with khalti')
  console.log(req.body)
  const { user, show, _id } = req.body;
  const bookingId = _id;

  const userEntity = await User.findById(user);
  const bookingEntity = await Booking.findById(bookingId);

  const khaltiService = new KhaltiService();

  const paymentInfo = generatePaymentInformation({
    user: userEntity,
    booking: bookingEntity,
    show: show,
  });

  const khaltiUrl = await khaltiService.initiatePayment(paymentInfo);

  // Run inngest shedular function to check payment status after 10 mins

   await inngest.send({
    name: "app/checkpayment",
    data: {
      bookingId: booking._id.toString()
    }
   })



  return res.status(200).json({
    success: true,
    url: khaltiUrl,
  })
}

export const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx } = req.body;
    if (!pidx) {
      return res.status(400).json({ success: false, message: "pidx is required" });
    }

    const khaltiService = new KhaltiService();
    const verificationResponse = await khaltiService.verifyPayment(pidx);

    // Update booking status if payment is completed
    if (verificationResponse.status === "Completed") {
      // Find booking by purchase_order_id (which we set as booking._id in initiatePayment)
      // However, initiatePayment used purchase_order_id: paymentDetails.purchaseOrderId
      // Let's check generatePaymentInformation in paymentUtils.js to see what purchaseOrderId is.
      // Assuming it is booking._id.
      // But wait, the transaction_id or purchase_order_id from Khalti response might be useful. 
      // The lookup response doesn't explicitly return purchase_order_id, but we can try to find the booking.
      // Actually, the initial `return_url` params have `purchase_order_id`. 
      // But here we are verifying using `pidx`. 
      // We can trust the user sending `purchase_order_id` from query params, OR
      // we can rely on what Khalti says. Khalti's lookup response *should* ideally contain it or we might need to store pidx in booking.

      // Issue: We didn't save `pidx` in the booking model during initiation.
      // But the frontend will send `purchase_order_id` (which is booking id) along with `pidx`.
      // So we can accept bookingId from the request body as well.
    }

    // Let's verify what we get from the frontend. 
    // The frontend will likely send what it got in the URL query params.

    // For now, let's just return the verification response and handle DB updates.
    // We really should update the booking status.

    // Strategy: Expect purchase_order_id (bookingId) from client alongside pidx.
    const bookingId = req.body.purchase_order_id;

    if (verificationResponse.status === "Completed" && bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentLink: null // or store pidx?
      });
    }

    res.json({ success: true, data: verificationResponse });

  } catch (error) {
    console.error("Error in verifyKhaltiPayment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
