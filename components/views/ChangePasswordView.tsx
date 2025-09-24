import React, { useState } from 'react';
import { ChevronLeftIcon } from '../icons/Icons';
import { supabase } from '../../services/supabase';

interface ChangePasswordViewProps {
  onBack: () => void;
  showSuccessToast: (message: string) => void;
}

const ChangePasswordView: React.FC<ChangePasswordViewProps> = ({ onBack, showSuccessToast }) => {
  // Supabase's updateUser doesn't require the current password.
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = () => {
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
        setError('New password must be at least 8 characters long.');
        return;
    }
    
    setIsProcessing(true);
    const changePassword = async () => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            setError(error.message);
            setIsProcessing(false);
        } else {
            showSuccessToast('Password updated successfully!');
            setTimeout(() => {
                onBack();
            }, 1500);
        }
    };
    changePassword();
  };

  return (
    <div className="h-full w-full bg-zinc-900 text-white flex flex-col">
      <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
        <button onClick={onBack} className="mr-4" disabled={isProcessing}>
          <ChevronLeftIcon />
        </button>
        <h1 className="text-lg font-bold">Change Password</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="new-password"
                   className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label htmlFor="confirm-password"
                   className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
      </main>

      <footer className="p-4 border-t border-zinc-800">
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full py-3 font-semibold rounded-lg bg-pink-600 hover:bg-pink-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Saving...' : 'Save Changes'}
        </button>
      </footer>
    </div>
  );
};

export default ChangePasswordView;