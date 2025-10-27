import React, { useState } from 'react';
import Title from '../../components/admin/Title';

const AddShow = () => {
  const [formData, setFormData] = useState({
    movieName: '',
    theater: '',
    posterUrl: '',
    price: '',
    showTimes: [new Date().toISOString().slice(0, 16)]
  });

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleShowTimeChange = (index, value) => {
    const updatedTimes = [...formData.showTimes];
    updatedTimes[index] = value;
    setFormData({ ...formData, showTimes: updatedTimes });
  };

  const addShowTime = () => {
    setFormData({ ...formData, showTimes: [...formData.showTimes, ''] });
  };

  const removeShowTime = (index) => {
    const updatedTimes = formData.showTimes.filter((_, i) => i !== index);
    setFormData({ ...formData, showTimes: updatedTimes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setMessage('Movie show added successfully!');
      setFormData({
        movieName: '',
        theater: '',
        posterUrl: '',
        price: '',
        showTimes: [new Date().toISOString().slice(0, 16)]
      });
    } catch {
      setMessage('Failed to add movie show.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Title text1="Add" text2="Movie Show" />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 mt-6 rounded-lg shadow-md max-w-2xl mx-auto relative z-50 text-gray-900"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Movie Name</label>
          <input
            type="text"
            name="movieName"
            value={formData.movieName}
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
            value={formData.theater}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-gray-900"
          />
        </div>

        {formData.showTimes.map((time, index) => (
          <div className="mb-4 flex items-center" key={index}>
            <input
              type="datetime-local"
              value={time}
              onChange={(e) => handleShowTimeChange(index, e.target.value)}
              required
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-gray-900"
            />
            {formData.showTimes.length > 1 && (
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
            value={formData.posterUrl}
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
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-gray-900"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {isSubmitting ? 'Adding...' : 'Add Show'}
        </button>

        {message && (
          <p
            className={`mt-4 text-sm text-center ${
              message.includes('successfully') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default AddShow;
