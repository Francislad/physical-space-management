import { useState } from 'react';
import apiClient from '../api/client';

const UserForm = ({ user, onSuccess, onCancel }) => {
  const isEdit = !!user;

  const [formData, setFormData] = useState({
    registerNumber: user?.registerNumber || '',
    name: user?.name || '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!isEdit && !formData.registerNumber) {
      setError('Register number is required');
      return false;
    }

    if (!isEdit && !formData.password) {
      setError('Password is required for new users');
      return false;
    }

    if (!isEdit && !formData.name) {
      setError('Name is required');
      return false;
    }

    if (formData.password && formData.password.length < 3) {
      setError('Password must be at least 3 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {};

      if (isEdit) {
        // Edit mode - only include fields that are provided
        payload.registerNumber = formData.registerNumber;
        if (formData.name) payload.name = formData.name;
        if (formData.password) payload.password = formData.password;

        await apiClient.put('/users/', payload);
      } else {
        // Create mode - all fields required
        payload.registerNumber = Number(formData.registerNumber);
        payload.name = formData.name;
        payload.password = formData.password;

        await apiClient.post('/users/', payload);
      }

      onSuccess();
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {isEdit ? 'Edit User' : 'Create New User'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Register Number *
            </label>
            <input
              id="registerNumber"
              name="registerNumber"
              type="number"
              value={formData.registerNumber}
              onChange={handleChange}
              disabled={isEdit || loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              required={!isEdit}
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name {!isEdit && '*'}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required={!isEdit}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password {!isEdit && '*'} {isEdit && '(leave empty to keep current)'}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required={!isEdit}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
