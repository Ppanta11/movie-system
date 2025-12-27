import React, { useEffect, useState } from 'react';
import { dummyShowsData } from '../../assets/assets';
import { CheckIcon, StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Title from '../../components/admin/Title.jsx';
import { kConverter } from '../../lib/kConverter.js';
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";

const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const { getToken } = useAppContext();
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState('');
  const [showPrice, setShowPrice] = useState('');
  const [addingShow, setAddingShow] = useState(false);

  const fetchNowPlayingMovies = async () => {
    setNowPlayingMovies(dummyShowsData);
  };

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

  const handleDateTimeAdd = () => {
    if (!dateTimeInput || !selectedMovie) return;

    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection(prev => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection(prev => {
      const filteredTimes = prev[date].filter(t => t !== time);
      const { [date]: _, ...rest } = prev;
      if (filteredTimes.length === 0) return rest;
      return { ...rest, [date]: filteredTimes };
    });
  };

  const handleSubmit = async () => {
    try {
      setAddingShow(true);

      if (!selectedMovie || Object.keys(dateTimeSelection).length === 0 || !showPrice) {
        return toast.error('Missing required fields');
      }

      const showInput = Object.entries(dateTimeSelection).map(([date, times]) => ({
        date,
        time: times
      }));

      const token = await getToken();
console.log("Token:", token);


      const payload = {
        movieId: selectedMovie,
        showsInput: showInput,
        showPrice: Number(showPrice)
      };

      const { data } = await axios.post(
        '/api/show/add',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );


      if (data.success) {
        toast.success(data.message);
        setSelectedMovie(null);
        setDateTimeSelection({});
        setShowPrice('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred. Please try again");
    } finally {
      setAddingShow(false);
    }
  };

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />

      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>
      <div className="overflow-x-auto pb-4">
        <div className="group flex flex-wrap gap-4 mt-4 w-max">
          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id}
              className="relative max-w-[10rem] cursor-pointer hover:opacity-90 hover:-translate-y-1 transition duration-300"
              onClick={() => setSelectedMovie(movie.id)}
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={movie.poster_path}
                  alt=""
                  className="w-full object-cover brightness-90"
                />
                <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                  <p className="flex items-center gap-1 text-gray-400">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {movie.vote_average.toFixed(1)}
                  </p>
                  <p className="text-gray-300">{kConverter(movie.vote_count)} Votes</p>
                </div>
              </div>

              {selectedMovie === movie.id && (
                <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
                  <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              )}

              <p className="font-medium truncate">{movie.title}</p>
              <p className="text-gray-400 text-sm">{movie.release_date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Show price input */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Show Price</label>
        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
          <p className="text-gray-400 text-sm">{currency}</p>
          <input
            min={0}
            type="number"
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Enter show price"
            className="outline-none"
          />
        </div>
      </div>

      {/* Date and time selection */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Select Date and Time</label>
        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md"
          />
          <button
            onClick={handleDateTimeAdd}
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
          >
            Add Time
          </button>
        </div>
      </div>

      {/* Display selected times */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Selected Show Times</p>
          {Object.entries(dateTimeSelection).map(([date, times]) => (
            <div key={date} className="mb-2">
              <p className="font-medium">{date}</p>
              <div className="flex flex-wrap gap-2">
                {times.map((time) => (
                  <div key={time} className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded">
                    <span>{time}</span>
                    <button
                      onClick={() => handleRemoveTime(date, time)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Show Button */}
      <div className="mt-6">
        <button
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80"
          onClick={handleSubmit}
          disabled={addingShow}
        >
          Add Show
        </button>
      </div>

      {/* Display Selected Times */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2">Selected Date-Time</h2>
          <ul className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className="font-medium">{date}</div>
                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="border border-primary px-2 py-1 flex items-center rounded"
                    >
                      <span>{time}</span>
                      <XMarkIcon
                        onClick={() => handleRemoveTime(date, time)}
                        width={15}
                        className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  ) : (
    <div>Loading...</div>
  );
};

export default AddShows;
