import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyDateTimeData, dummyShowsData } from "../assets/assets";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";
import KhaltiCheckout from "khalti-checkout-web";

const SeatLayout = () => {
  const rows = ["A","B","C","D","E","F","G","H","I","J","K","L","M"];
  const seatsPerRow = 12;

  const { id, date } = useParams();
  const navigate = useNavigate();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const KHALTI_PUBLIC_KEY = import.meta.env.VITE_KHALTI_PUBLIC_KEY;
  
  // Load show data
  useEffect(() => {
    const foundShow = dummyShowsData.find((show) => show._id === id);
    if (foundShow) {
      setShow({ movie: foundShow, dateTime: dummyDateTimeData });
    }
  }, [id]);

  // Seat selection
  const handleSeatClick = (seatId) => {
    if (!selectedTime) return toast("Select time first");
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5)
      return toast("Max 5 seats");

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  if (!show) return <p className="mt-20 text-center">Loading...</p>;

  const khaltiConfig = {
    publicKey: KHALTI_PUBLIC_KEY,
    productIdentity: show.movie._id,
    productName: show.movie.title,
    productUrl: "http://localhost:3000",
    eventHandler: {
      onSuccess(payload) {
        console.log(payload);
        toast.success("Payment Successful");
        navigate("/my-bookings");
      },
      onError(error) {
        console.error(error);
        toast.error("Payment Failed");
      },
      onClose() {
        console.log("Khalti closed");
      },
    },
    paymentPreference: ["KHALTI"],
  };

  const handlePayment = () => {
    if (!selectedTime || selectedSeats.length === 0)
      return toast("Select time & seats");

    const checkout = new KhaltiCheckout(khaltiConfig);
    checkout.show({
      amount: selectedSeats.length * 300 * 100, // Rs 300 per seat
    });
  };

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-28 gap-14">

      {/* Timings */}
      <div className="w-64 bg-primary/5 border border-primary/10 rounded-xl p-8 h-max">
        <p className="text-lg font-semibold mb-6">Timings</p>

        {show.dateTime[date]?.map((item) => (
          <div
            key={item.time}
            onClick={() => setSelectedTime(item)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer mb-2
              ${selectedTime?.time === item.time ? "bg-primary text-white" : "hover:bg-primary/10"}`}
          >
            <ClockIcon className="w-4 h-4" />
            <p className="text-sm">{isoTimeFormat(item.time)}</p>
          </div>
        ))}
      </div>

      {/* Seats */}
      <div className="relative flex-1 flex flex-col items-center">
        <BlurCircle top="-120px" left="-120px" />
        <BlurCircle bottom="0px" right="0px" />

        <h1 className="text-xl font-semibold mb-6">Select Seats</h1>

        {/* Screen */}
        <div className="w-full max-w-xl mb-10">
          <div className="h-2 bg-primary/30 rounded-full mb-2" />
          <p className="text-center text-xs text-gray-400">SCREEN</p>
        </div>

        {/* Seat Grid */}
        <div className="space-y-4 overflow-x-auto pb-4">
          {rows.map((row) => (
            <div key={row} className="flex items-end gap-4">
              <span className="w-5 text-sm text-gray-400">{row}</span>
              <div className="flex gap-3">
                {Array.from({ length: seatsPerRow }, (_, i) => {
                  const seatId = `${row}${i + 1}`;
                  const active = selectedSeats.includes(seatId);
                  return (
                    <button
                      key={seatId}
                      onClick={() => handleSeatClick(seatId)}
                      className="group relative w-10 h-10 flex flex-col items-center"
                    >
                      <div className={`w-8 h-5 rounded-t-lg transition ${active ? "bg-primary" : "bg-gray-600 group-hover:bg-primary/70"}`} />
                      <div className={`w-10 h-4 rounded-md mt-0.5 transition ${active ? "bg-primary" : "bg-gray-700 group-hover:bg-primary/50"}`} />
                      <div
                        className={`absolute inset-0 rounded-lg transition ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                        style={{ boxShadow: "0 0 10px rgba(99,102,241,0.6)" }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handlePayment}
          className="mt-16 px-12 py-3 rounded-full bg-primary text-sm font-medium hover:bg-primary-dull transition"
        >
          Proceed to Pay
          <ArrowRightIcon className="inline ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SeatLayout;
