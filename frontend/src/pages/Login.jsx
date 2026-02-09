import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

const Login = () => {
    const [registerNumber, setRegisterNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isAdminLogin = searchParams.get('admin') === 'true';

    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Client-side validation
        if (!registerNumber || !password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        const result = await login(Number(registerNumber), password);

        if (result.success) {
            // Redirect based on user role
            if (result.user.role === ROLES.ADMIN) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            setError(result.error);
        }

        setIsLoading(false);
    };

    const toggleLoginMode = () => {
        if (isAdminLogin) {
            navigate('/login');
        } else {
            navigate('/login?admin=true');
        }
        setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-md w-full max-w-sm sm:max-w-md">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 text-left mb-2">
                    Physical Space Management
                </h1>
                <hr></hr>
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 mt-2 text-gray-800 text-right">
                    {isAdminLogin ? 'Admin Login' : 'User Login'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                        <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Register Number
                        </label>
                        <input
                            id="registerNumber"
                            type="number"
                            value={registerNumber}
                            onChange={(e) => setRegisterNumber(e.target.value)}
                            className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white py-2.5 sm:py-3 px-4 rounded-md text-sm sm:text-base font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    )
};

export default Login;
