import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { ROLES } from '../utils/constants';

const Navbar = () => {
    const { user, checkIn, logout, setCheckIn } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCheckout = async () => {
        if (!checkIn) return;

        try {
            await apiClient.post('/checkins/checkout', {
                room: checkIn.room,
            });
            setCheckIn(null);
            alert('Checked out successfully!');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to check out';
            alert(message);
        }
    };

    const formatCheckInTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-rows-2 grid-cols-1 sm:grid-rows-1 sm:grid-cols-2 items-center h-40 sm:h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-800">
                            Physical Space Management
                        </h1>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 items-center">
                        <div className='col-span-2'>
                            {checkIn && (
                            <div className="bg-warning bg-opacity-20 border border-warning px-3 py-1 rounded-md flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-800">
                                    Checked in: {checkIn.room} ({formatCheckInTime(checkIn.checkedInAt)})
                                </span>
                                <button
                                    onClick={handleCheckout}
                                    className="text-xs bg-danger text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                                >
                                    Check Out
                                </button>
                            </div>
                        )}
                        </div>

                        {user && (
                            <span className="text-sm text-gray-600 self-center justify-self-center">
                                {user.name} {user.role === ROLES.ADMIN && '(Admin)'}
                            </span>
                        )}

                        <button
                            onClick={handleLogout}
                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm sm:order-last"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
