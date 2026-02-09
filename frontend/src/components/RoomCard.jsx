import { useNavigate } from 'react-router-dom';

const RoomCard = ({ room }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/room/${encodeURIComponent(room.name)}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{room.name}</h3>
      <div className="text-gray-600">
        <p className="text-sm">
          Current Capacity: <span className="font-medium">{room.currentOccupancy}</span>
        </p>
      </div>
    </div>
  );
};

export default RoomCard;
