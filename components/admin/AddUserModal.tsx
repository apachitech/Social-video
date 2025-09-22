import React, { useState } from 'react';
import { User } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface AddUserModalProps {
  onClose: () => void;
  onAddUser: (newUser: User) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAddUser }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('user');
  const [status, setStatus] = useState<User['status']>('active');
  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      alert("Username and email are required.");
      return;
    }

    const newUser: User = {
      id: `u${Date.now()}`,
      username,
      email,
      role,
      status,
      isVerified,
      avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0],
      bio: '',
      followers: 0,
      following: 0,
      followingIds: [],
      wallet: { balance: 0, transactions: [] },
      creatorStats: { totalEarnings: 0, receivedGiftsCount: 0 },
      level: 1,
      xp: 0,
      streakCount: 0,
      badges: [],
    };

    onAddUser(newUser);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md text-gray-800 dark:text-white relative animate-fade-in-up border border-gray-200 dark:border-zinc-800">
        <header className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
          <h2 className="text-xl font-bold">Add New User</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
            <CloseIcon />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <main className="p-6 space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as User['role'])}
                  className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="user">User</option>
                  <option value="creator">Creator</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as User['status'])}
                  className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>
            <div className="flex items-center">
              <input
                id="isVerified"
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Verified Account
              </label>
            </div>
          </main>

          <footer className="flex justify-end gap-3 p-4 border-t dark:border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors font-semibold text-sm">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-md bg-pink-600 hover:bg-pink-700 transition-colors font-semibold text-white text-sm">
              Create User
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;