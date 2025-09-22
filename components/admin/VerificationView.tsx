
import React from 'react';
import { User } from '../../types';
import { ChevronLeftIcon } from '../icons/Icons';

interface VerificationViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
}

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

const VerificationView: React.FC<VerificationViewProps> = ({ user, onUpdateUser, onBack }) => {

  const handleApprove = () => {
    onUpdateUser({ ...user, isVerified: true });
    onBack();
  };

  const handleReject = () => {
    // For now, just go back. A real app might have a rejection reason modal.
    onBack();
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
      <header className="flex items-center p-4 border-b dark:border-zinc-800">
        <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800">
          <ChevronLeftIcon />
        </button>
        <h2 className="text-lg font-semibold">Verification Request for @{user.username}</h2>
      </header>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Details */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-lg font-bold">User Details</h3>
          <img src={user.avatarUrl} alt={user.username} className="w-32 h-32 rounded-full mx-auto" />
          <div className="space-y-2 text-center md:text-left">
            <DetailItem label="Username" value={`@${user.username}`} />
            <DetailItem label="Email" value={user.email} />
            <DetailItem label="User ID" value={user.id} />
            <DetailItem label="Join Date" value={user.joinDate} />
          </div>
        </div>

        {/* Submitted Documents */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-bold">Submitted Documents</h3>
          <div className="space-y-4">
            {/* Placeholder for ID */}
            <div>
              <p className="font-semibold mb-2">Government-Issued ID</p>
              <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg p-4 flex items-center justify-center h-48 border-2 border-dashed dark:border-zinc-700">
                <img src="https://via.placeholder.com/300x150.png?text=ID+Document" alt="ID Document" className="max-h-full max-w-full" />
              </div>
            </div>
            {/* Placeholder for social links */}
            <div>
                <p className="font-semibold mb-2">Social Media Links</p>
                <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg p-4 space-y-2 text-sm">
                    <p><span className="font-medium text-gray-500 dark:text-gray-400">Twitter:</span> <a href="#" className="text-blue-500 hover:underline">https://twitter.com/{user.username}</a></p>
                    <p><span className="font-medium text-gray-500 dark:text-gray-400">Instagram:</span> <a href="#" className="text-pink-500 hover:underline">https://instagram.com/{user.username}</a></p>
                </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="flex justify-end gap-3 p-4 border-t dark:border-zinc-800">
        <button onClick={handleReject} className="px-6 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors font-semibold text-sm">
          Reject
        </button>
        <button onClick={handleApprove} className="px-6 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors font-semibold text-white text-sm">
          Approve Verification
        </button>
      </footer>
    </div>
  );
};

export default VerificationView;
