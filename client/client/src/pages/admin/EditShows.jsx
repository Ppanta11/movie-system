import React, { useState, useEffect } from 'react';
import Title from '../../components/admin/Title';

const EditShows = () => {
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch shows from backend or use static data
    const fetchedShows = [
      { id: 1, movieName: 'Movie A', theater: 'Theater 1', posterUrl: '', price: '10', showTimes: ['2025-10-26T10:00', '2025-10-26T14:00'] },
      { id: 2, movieName: 'Movie B', theater: 'Theater 2', posterUrl: '', price: '12', showTimes: ['2025-10-26T12:00'] },
    ];
    setShows(fetchedShows);
  }, []);

  const handleSelect = (show) => {
    setSelectedShow({ ...show });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedShow({ ...selectedShow, [name]: value });
  };

  const handleShowTimeChange = (index, value) => {
    const updatedTimes = [...selectedShow.showTimes];
    updatedTimes[index] = value;
    setSelectedShow({ ...selectedShow, showTimes: updatedTimes });
  };

  const addShowTime = () => {
    setSelectedShow({ ...selectedShow, showTimes: [...selectedShow.showTimes, ''] });
  };

  const removeShowTime = (index) => {
    const updatedTimes = selectedShow.showTimes.filter((_, i) => i !== index);
    setSelectedShow({ ...selectedShow, showTimes: updatedTimes });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const updatedShows = shows.map(show => show.id === selectedShow.id ? selectedShow : show);
    setShows(updatedShows);
    setMessage('Movie show updated successfully!');
    setTimeout(() => setMessage(''), 3000);
    setSelectedShow(null);
  };

  return (
    <div className="p-6">
      <Title text1="Edit" text2="Shows" />
      {message && (
        <p className="mt-4 text-sm text-center text-green-600">{message}</p>
      )}

      <div className="mt-6 max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {selectedShow ? (
          <form onSubmit={handleUpdate}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Movie Name</label>
              <input
                type="text"
                name="movieName"
                value={selectedShow.movieName}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-gray-900"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Theater</label>
              <input
                type="text"
                name="theater"
                value={selectedShow.theater}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-gray-900"
              />
            </div>

            {selectedShow.showTimes.map((time, index) => (
              <div className="mb-4 flex items-center" key={index}>
                <input
                  type="datetime-local"
                  value={time}
                  onChange={(e) => handleShowTimeChange(index, e.target.value)}
                  required
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-gray-900"
                />
                {selectedShow.showTimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeShowTime(index)}
                    className="ml-2 bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addShowTime}
              className="mb-4 bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark"
            >
              + Add Another Show Time
            </button>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Poster URL</label>
              <input
                type="url"
                name="posterUrl"
                value={selectedShow.posterUrl}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-gray-900"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Ticket Price</label>
              <input
                type="number"
                name="price"
                value={selectedShow.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-gray-900"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark"
            >
              Update Show
            </button>
          </form>
        ) : (
          <ul className="space-y-4">
            {shows.map(show => (
              <li key={show.id} className="flex justify-between items-center border p-4 rounded-md">
                <div>
                  <h3 className="font-semibold">{show.movieName}</h3>
                  <p className="text-gray-600">{show.theater}</p>
                  <p className="text-gray-500 text-sm">{show.showTimes.join(', ')}</p>
                </div>
                <button
                  onClick={() => handleSelect(show)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EditShows;
