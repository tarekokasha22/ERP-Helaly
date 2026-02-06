import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import api from '../services/apiService';
import { mockGetUsers, mockCreateUser, mockUpdateUser, mockDeleteUser } from '../services/mockApi';
import { toast } from 'react-toastify';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

// Flag to use mock API for development
const USE_MOCK_API = false;

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'worker';
  position: string;
  active: boolean;
  createdAt: string;
};

const Users: React.FC = () => {
  const { t, language } = useLanguage();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'worker',
    position: '',
    password: '',
    active: true
  });

  // Fetch users data with proper error handling
  const { data: users = [], isLoading } = useQuery<User[]>(
    ['users'],
    async () => {
      try {
        if (USE_MOCK_API) {
          return await mockGetUsers();
        } else {
          const res = await api.get('/users');
          return res.data?.data || [];
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error(t('messages', 'networkError'));
        return [];
      }
    },
    {
      staleTime: 30000 // 30 seconds
    }
  );

  // Create user mutation
  const createUserMutation = useMutation(
    async (userData: any) => {
      if (USE_MOCK_API) {
        return await mockCreateUser(userData);
      } else {
        const response = await api.post('/users', userData);
        return response.data;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        queryClient.refetchQueries(['users']);

        // Dispatch custom event to notify dashboard of new user
        window.dispatchEvent(new CustomEvent('userAdded'));
        console.log('🚀 User created successfully!');

        toast.success(t('messages', 'successfulOperation'));
        setShowAddModal(false);
        resetForm();
      },
      onError: (error) => {
        console.error('Add user error:', error);
        toast.error(t('messages', 'errorOperation'));
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  // Update user mutation
  const updateUserMutation = useMutation(
    async ({ id, userData }: { id: string; userData: any }) => {
      if (USE_MOCK_API) {
        return await mockUpdateUser(id, userData);
      } else {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success(t('messages', 'successfulOperation'));
        setShowEditModal(false);
      },
      onError: (error) => {
        console.error('Update user error:', error);
        toast.error(t('messages', 'errorOperation'));
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(
    async (id: string) => {
      if (USE_MOCK_API) {
        return await mockDeleteUser(id);
      } else {
        return await api.delete(`/users/${id}`);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success(t('messages', 'successfulOperation'));
      },
      onError: (error) => {
        console.error('Delete user error:', error);
        toast.error(t('messages', 'errorOperation'));
      }
    }
  );

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'worker',
      position: '',
      password: '',
      active: true
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validateUserForm = () => {
    // Name validation
    if (!formData.name.trim()) {
      toast.error(t('validation', 'nameRequired') || 'Name is required');
      return false;
    }

    // Email validation
    if (!formData.email.trim()) {
      toast.error(t('validation', 'emailRequired') || 'Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t('validation', 'invalidEmail') || 'Invalid email format');
      return false;
    }

    // Position validation
    if (!formData.position.trim()) {
      toast.error(t('validation', 'positionRequired') || 'Position is required');
      return false;
    }

    // Password validation (only for adding new user)
    if (!showEditModal && !formData.password.trim()) {
      toast.error(t('validation', 'passwordRequired') || 'Password is required');
      return false;
    }

    return true;
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUserForm()) {
      return;
    }

    setIsSubmitting(true);
    createUserMutation.mutate(formData);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!validateUserForm()) {
      return;
    }

    setIsSubmitting(true);

    // Create payload without password if it's empty
    const payload = { ...formData };
    if (!payload.password) {
      delete payload.password;
    }

    updateUserMutation.mutate({
      id: selectedUser.id,
      userData: payload
    });
  };

  const handleDeleteUser = async (userId: string) => {
    // Check if trying to delete yourself
    if (currentUser?.id === userId) {
      toast.error(t('messages', 'cannotDeleteYourself') || "You cannot delete your own account");
      return;
    }

    if (window.confirm(t('messages', 'confirmDelete'))) {
      deleteUserMutation.mutate(userId);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position,
      password: '', // Empty password field for editing
      active: user.active
    });
    setShowEditModal(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">{t('common', 'loading')}</div>;
  }

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('users', 'title') || 'Users Management'}</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className={`${language === 'ar' ? '-mr-1 ml-2' : '-ml-1 mr-2'} h-5 w-5`} aria-hidden="true" />
          {t('users', 'addUser') || 'Add User'}
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {users.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500">{t('common', 'noData')}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users', 'user') || 'User'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users', 'position') || 'Position'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users', 'role') || 'Role'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users', 'status') || 'Status'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users', 'joined') || 'Joined'}
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t('common', 'actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
                        <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                      </div>
                      <div className={`${language === 'ar' ? 'mr-4' : 'ml-4'}`}>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {user.role === 'admin' ? t('users', 'admin') || 'Administrator' : t('users', 'worker') || 'Worker'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {user.active ? t('common', 'active') || 'Active' : t('common', 'inactive') || 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(user)}
                      className={`text-gray-600 hover:text-gray-900 ${language === 'ar' ? 'ml-3' : 'mr-3'}`}
                    >
                      <PencilIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={currentUser?.id === user.id}
                    >
                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{t('users', 'addUser') || 'Add New User'}</h3>
                    <form onSubmit={handleAddUser}>
                      <div className="mb-4">
                        <label htmlFor="name" className="form-label">{t('users', 'name') || 'Full Name'}</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="form-input focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="email" className="form-label">{t('users', 'email') || 'Email'}</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="form-input focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="position" className="form-label">{t('users', 'position') || 'Position'}</label>
                        <input
                          type="text"
                          id="position"
                          name="position"
                          required
                          className="form-input focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.position}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="role" className="form-label">{t('users', 'role') || 'Role'}</label>
                        <select
                          id="role"
                          name="role"
                          required
                          className="form-input focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.role}
                          onChange={handleInputChange}
                        >
                          <option value="worker">{t('users', 'worker') || 'Worker'}</option>
                          <option value="admin">{t('users', 'admin') || 'Administrator'}</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="password" className="form-label">{t('users', 'password') || 'Password'}</label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          required
                          className="form-input focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.password}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-4 flex items-center">
                        <input
                          type="checkbox"
                          id="active"
                          name="active"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={formData.active}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                          {t('common', 'active') || 'Active'}
                        </label>
                      </div>
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {isSubmitting ? t('common', 'loading') : t('users', 'add') || 'Add User'}
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setShowAddModal(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          {t('common', 'cancel')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{t('users', 'editUser') || 'Edit User'}</h3>
                    <form onSubmit={handleEditUser}>
                      <div className="mb-4">
                        <label htmlFor="edit-name" className="form-label">{t('users', 'name') || 'Full Name'}</label>
                        <input
                          type="text"
                          id="edit-name"
                          name="name"
                          required
                          className="form-input focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="edit-email" className="form-label">{t('users', 'email') || 'Email'}</label>
                        <input
                          type="email"
                          id="edit-email"
                          name="email"
                          required
                          className="form-input focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="edit-position" className="form-label">{t('users', 'position') || 'Position'}</label>
                        <input
                          type="text"
                          id="edit-position"
                          name="position"
                          required
                          className="form-input focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.position}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="edit-role" className="form-label">{t('users', 'role') || 'Role'}</label>
                        <select
                          id="edit-role"
                          name="role"
                          required
                          className="form-input focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.role}
                          onChange={handleInputChange}
                        >
                          <option value="worker">{t('users', 'worker') || 'Worker'}</option>
                          <option value="admin">{t('users', 'admin') || 'Administrator'}</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="edit-password" className="form-label">
                          {t('users', 'password') || 'Password'} <span className="text-sm text-gray-500">{t('users', 'passwordHint') || '(Leave blank to keep current password)'}</span>
                        </label>
                        <input
                          type="password"
                          id="edit-password"
                          name="password"
                          className="form-input focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.password}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-4 flex items-center">
                        <input
                          type="checkbox"
                          id="edit-active"
                          name="active"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={formData.active}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="edit-active" className="ml-2 block text-sm text-gray-900">
                          {t('common', 'active') || 'Active'}
                        </label>
                      </div>
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {isSubmitting ? t('common', 'loading') : t('users', 'save') || 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setShowEditModal(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          {t('common', 'cancel')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 