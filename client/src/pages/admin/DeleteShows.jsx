import React, { useState, useEffect } from 'react';
import Title from '../../components/admin/Title';

const DeleteShows = () => {
  const [shows, setShows] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchedShows = [
      { id: 1, movieName: 'Movie A', theater: 'Theater 1', showTimes: ['2025-10-26T10:00', '2025-10-26T14:00'] },
      { id: 2, movieName: 'Movie B', theater: 'Theater 2', showTimes: ['2025-10-26T12:00'] },
    ];
    setShows(fetchedShows);
  }, []);

  const handleDelete = (id) => {
    const updatedShows = shows.filter(show => show.id !== id);
    setShows(updatedShows);
    setMessage('Show deleted successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="p-6">
      <Title text1="Delete" text2="Shows" />
      {message && (
        <p className="mt-4 text-sm text-center text-green-600">{message}</p>
      )}
      <div className="mt-6 max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {shows.length === 0 ? (
          <p className="text-center text-gray-600">No shows available.</p>
        ) : (
          <ul className="space-y-4">
            {shows.map(show => (
              <li key={show.id} className="flex justify-between items-center border p-4 rounded-md">
                <div>
                  <h3 className="font-semibold">{show.movieName}</h3>
                  <p className="text-gray-600">{show.theater}</p>
                  <p className="text-gray-500 text-sm">
                    {show.showTimes.join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(show.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DeleteShows;
