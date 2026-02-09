import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const RoomDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { checkIn, setCheckIn } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRoomDetails();
  }, [name]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/rooms/${encodeURIComponent(name)}`);
      setRoom(response.data);
      setError('');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load room details';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const response = await apiClient.post('/checkins/checkin', {
        room: name,
      });
      setCheckIn(response.data);
      alert('Checked in successfully!');
      fetchRoomDetails(); // Refresh room data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to check in';
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await apiClient.post('/checkins/checkout', {
        room: name,
      });
      setCheckIn(null);
      alert('Checked out successfully!');
      fetchRoomDetails(); // Refresh room data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to check out';
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  const getButtonConfig = () => {
    if (!checkIn) {
      return {
        label: 'Check In',
        onClick: handleCheckIn,
        disabled: false,
        className: 'bg-success hover:bg-green-600',
      };
    }

    if (checkIn.room === name) {
      return {
        label: 'Check Out',
        onClick: handleCheckOut,
        disabled: false,
        className: 'bg-danger hover:bg-red-600',
      };
    }

    return {
      label: `Already checked in to ${checkIn.room}`,
      onClick: null,
      disabled: true,
      className: 'bg-gray-400 cursor-not-allowed',
    };
  };

  const buttonConfig = getButtonConfig();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading room details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            ← Back to rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="text-primary hover:underline mb-6 inline-block"
        >
          ← Back to rooms
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{room.name}</h1>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-gray-600">Capacity:</span>
              <span className="text-xl font-semibold text-gray-800">{room.capacity}</span>
            </div>

            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-gray-600">Current Capacity:</span>
              <span className="text-xl font-semibold text-gray-800">{room.currentOccupancy || 0}</span>
            </div>
          </div>

          <div className="mt-6">
            {buttonConfig.disabled && checkIn && checkIn.room !== name && (
              <p className="text-sm text-gray-600 mb-3">
                You must check out of {checkIn.room} before checking into this room.
              </p>
            )}

            <button
              onClick={buttonConfig.onClick}
              disabled={buttonConfig.disabled || actionLoading}
              className={`w-full text-white py-3 px-4 rounded-md transition-colors text-lg font-medium ${buttonConfig.className} ${
                actionLoading ? 'opacity-70' : ''
              }`}
            >
              {actionLoading ? 'Processing...' : buttonConfig.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
