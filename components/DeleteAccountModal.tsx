import React, { useState } from 'react';
import { User } from '../types';
import { CloseIcon } from './icons/Icons';

interface DeleteAccountModalProps {
  user: User;
  onClose: () => void;
  onConfirmDelete: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ user, onClose, onConfirmDelete }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const isConfirmed = confirmationText === user.username;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-sm text-white relative animate-fade-in-up">
        <header className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-xl font-bold text-red-500">Delete Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon />
          </button>
        </header>

        <main className="p-6 space-y-4">
          <p className="text-sm text-gray-300">
            This action is <span className="font-bold">permanent and irreversible</span>. All your data, videos, and wallet balance will be permanently deleted.
          </p>
          <p className="text-sm text-gray-300">
            To confirm, please type your username: <span className="font-bold text-pink-400">{user.username}</span>
          </p>
          <div>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type username to confirm"
              className="w-full p-2 bg-zinc-700 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </main>

        <footer className="p-4 border-t border-zinc-700 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-zinc-700 hover:bg-zinc-600 transition-colors font-semibold">
              Cancel
            </button>
            <button
                onClick={onConfirmDelete}
                disabled={!isConfirmed}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Permanently Delete
            </button>
        </footer>
      </div>
    </div>
  );
};

export default DeleteAccountModal;