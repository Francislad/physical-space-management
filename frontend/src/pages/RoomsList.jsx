import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RoomCard from '../components/RoomCard';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

const RoomsList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/rooms/');
      setRooms(response.data);
      setError('');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load rooms';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Available Rooms</h2>
          
          {user && user.role === ROLES.ADMIN && (
            <button
              onClick={() => navigate('/admin')}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Admin Panel
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading rooms...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && rooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No rooms available</p>
          </div>
        )}

        {!loading && !error && rooms.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room.name} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsList;
