import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import toast from "react-hot-toast";
import BlurCircle from "../components/BlurCircle";
import isoTimeFormat from "../lib/isoTimeFormat";
import { useAppContext } from "../context/AppContext";

const SeatLayout = () => {
  const rows = ["A","B","C","D","E","F","G","H","I","J","K","L","M"];
  const seatsPerRow = 12;

  const { id, date } = useParams();
  const navigate = useNavigate();
  const { axios, user, getToken } = useAppContext();

  const [show, setShow] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  // Fetch show details
  const getShow = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      setShow(data.show || data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch show");
    }
  }, [axios, id]);

  useEffect(() => {
    getShow();
  }, [getShow]);

  // Fetch occupied seats
  const getOccupiedSeats = useCallback(async () => {
    if (!selectedTime) return;
    try {
      const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`);
      if (data.success) setOccupiedSeats(data.occupiedSeats);
      else toast.error(data.message);
    } catch (error) {
      console.error(error);
    }
  }, [axios, selectedTime]);

  useEffect(() => {
    getOccupiedSeats();
  }, [getOccupiedSeats]);

  // Handle seat selection
  const handleSeatClick = (seatId) => {
    if (!selectedTime) return toast("Select time first");
    if (occupiedSeats.includes(seatId)) return toast("This seat is already booked");
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5)
      return toast("You cannot select more than 5 seats");

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  // Book ticket
  const bookTickets = async () => {
    try {
      if (!user) return toast.error("Please login to proceed");
      if (!selectedTime || !selectedSeats.length)
        return toast.error("Please select a time and seats");

      const { data } = await axios.post(
        `/api/booking/create`,
        { showId: selectedTime.showId, selectedSeats },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/my-bookings");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!show) return <p className="mt-20 text-center">Loading...</p>;

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-28 gap-14">
      {/* Timings */}
      <div className="w-64 bg-primary/5 border border-primary/10 rounded-xl p-8 h-max">
        <p className="text-lg font-semibold mb-6">Timings</p>
        {show.dateTime?.[date]?.map((item) => (
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
                  const isOccupied = occupiedSeats.includes(seatId);
                  const isDisabled = isOccupied || (!active && selectedSeats.length >= 5);

                  return (
                    <button
                      key={seatId}
                      onClick={() => handleSeatClick(seatId)}
                      disabled={isDisabled}
                      className={`group relative w-10 h-10 flex flex-col items-center ${
                        isDisabled ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-5 rounded-t-lg transition ${
                          active ? "bg-primary" : isOccupied ? "bg-red-600" : "bg-gray-600 group-hover:bg-primary/70"
                        }`}
                      />
                      <div
                        className={`w-10 h-4 rounded-md mt-0.5 transition ${
                          active ? "bg-primary" : isOccupied ? "bg-red-700" : "bg-gray-700 group-hover:bg-primary/50"
                        }`}
                      />
                      {active && (
                        <div
                          className="absolute inset-0 rounded-lg"
                          style={{ boxShadow: "0 0 10px rgba(99,102,241,0.6)" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={bookTickets}
          className="mt-16 px-12 py-3 rounded-full bg-primary text-sm font-medium hover:bg-primary-dull transition flex items-center"
        >
          Continue
          <ArrowRightIcon className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SeatLayout;
