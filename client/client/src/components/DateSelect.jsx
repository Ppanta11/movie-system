import React, { useState } from 'react';
import BlurCircle from './BlurCircle';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DateSelect = ({ dateTime, id }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

  const onBookHandler = () => {
    if (!selectedDate) {
      return toast.error("Please select a date");
    }
    try {
      navigate(`/movies/${id}/${selectedDate}`);
      scrollTo(0, 0);
    } catch (error) {
      toast.error("Navigation failed. Please try again.");
    }
  };

  return (
    <div id='dateSelect' className='pt-30'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-10
        relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle top="100px" right="0px" />

        <div>
          <p className='text-lg font-semibold'>Choose Date</p>
          <div className='flex items-center gap-6 text-sm mt-5'>
            <ChevronLeftIcon width={28} aria-label="Previous dates" />
            <span className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>
              {Object.keys(dateTime).map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer ${
                    selectedDate === date ? 'bg-primary text-white' : 'border border-primary/70 hover:bg-primary/20'
                  }`}
                  aria-pressed={selectedDate === date}
                >
                  <span>{new Date(date).getDate()}</span>
                  <span>{new Date(date).toLocaleString("en-US", { month: "short" })}</span>
                </button>
              ))}
            </span>
            <ChevronRightIcon width={28} aria-label="Next dates" />
          </div>
        </div>
        <button
          onClick={onBookHandler}
          className='bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer'
          aria-label="Book tickets for selected date"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DateSelect;
