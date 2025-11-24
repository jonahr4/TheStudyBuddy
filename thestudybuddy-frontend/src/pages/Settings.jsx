import { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import { userApi } from '../services/api';

export default function Settings() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');
    
    try {
      // Delete user from MongoDB first
      try {
        await userApi.deleteUser();
      } catch (mongoError) {
        console.error('Failed to delete user from MongoDB:', mongoError);
        // Continue with Firebase deletion even if MongoDB fails
      }
      
      // Delete user from Firebase
      await currentUser.delete();
      
      // Redirect to landing page
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      
      // If re-authentication is required
      if (error.code === 'auth/requires-recent-login') {
        setError('For security, please log out and log back in before deleting your account.');
      } else {
        setError('Failed to delete account. Please try again.');
      }
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="gradient-bg min-h-screen">
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>

      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Account Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Information */}
        <div className="card mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Profile Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {currentUser?.displayName || 'Not set'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {currentUser?.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Created
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {new Date(currentUser?.metadata?.creationTime).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Sign In
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {new Date(currentUser?.metadata?.lastSignInTime).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Account Actions
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Sign Out</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Sign out from this device
                  </div>
                </div>
                <span className="text-xl">→</span>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-2 border-red-200 dark:border-red-900">
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
            Danger Zone
          </h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Once you delete your account, there is no going back. This will permanently delete:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-2">
              <li>All your subjects and notes</li>
              <li>All your flashcard sets and progress</li>
              <li>All your chat history</li>
              <li>Your profile and account data</li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting Account...' : 'Delete Account'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Account"
        message="Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
        confirmText="Delete My Account"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={() => {
          setShowDeleteDialog(false);
          handleDeleteAccount();
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

