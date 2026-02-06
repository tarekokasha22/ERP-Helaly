import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '555-123-4567', // Mock data
    position: 'Project Manager', // Mock data
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, we would call API to update user profile
      // await api.put('/users/profile', profileData);
      
      toast.success(t('profile', 'profileUpdated'));
      setIsEditingProfile(false);
    } catch (error) {
      toast.error(t('profile', 'profileUpdateFailed'));
      console.error('Update profile error:', error);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('profile', 'passwordMismatch'));
      return;
    }
    
    try {
      // In a real app, we would call API to change password
      // await api.put('/users/password', {
      //   currentPassword: passwordData.currentPassword,
      //   newPassword: passwordData.newPassword,
      // });
      
      toast.success(t('profile', 'passwordChanged'));
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(t('profile', 'passwordChangeFailed'));
      console.error('Change password error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('profile', 'title')}</h1>

      {/* Profile Information */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{t('profile', 'profileInformation')}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{t('profile', 'personalDetails')}</p>
          </div>
          {!isEditingProfile && (
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {t('profile', 'editProfile')}
            </button>
          )}
        </div>
        <div className="border-t border-gray-200">
          {!isEditingProfile ? (
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{t('profile', 'fullName')}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.name}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{t('profile', 'emailAddress')}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.email}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{t('profile', 'phoneNumber')}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.phone}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{t('profile', 'position')}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.position}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{t('profile', 'role')}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user?.role === 'admin' ? t('profile', 'administrator') : t('profile', 'worker')}
                  </span>
                </dd>
              </div>
            </dl>
          ) : (
            <div className="p-4 sm:p-6">
              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="name" className="form-label">
                      {t('profile', 'fullName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="email" className="form-label">
                      {t('profile', 'emailAddress')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="phone" className="form-label">
                      {t('profile', 'phoneNumber')}
                    </label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      autoComplete="tel"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="position" className="form-label">
                      {t('profile', 'position')}
                    </label>
                    <input
                      type="text"
                      name="position"
                      id="position"
                      value={profileData.position}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="btn-secondary"
                  >
                    {t('profile', 'cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {t('profile', 'saveChanges')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{t('profile', 'password')}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{t('profile', 'changePassword')}</p>
          </div>
          {!isChangingPassword && (
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {t('profile', 'changePassword')}
            </button>
          )}
        </div>
        {isChangingPassword && (
          <div className="border-t border-gray-200 p-4 sm:p-6">
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="form-label">
                    {t('profile', 'currentPassword')}
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="form-label">
                    {t('profile', 'newPassword')}
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">
                    {t('profile', 'confirmNewPassword')}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="btn-secondary"
                >
                  {t('profile', 'cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {t('profile', 'updatePassword')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 
