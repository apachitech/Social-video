import React, { useState } from 'react';
import { CloseIcon } from './icons/Icons';

interface ApplyCreatorModalProps {
  onClose: () => void;
  onSubmit: (message: string) => void;
}

const ApplyCreatorModal: React.FC<ApplyCreatorModalProps> = ({ onClose, onSubmit }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    onSubmit(message);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-sm text-white relative animate-fade-in-up">
        <header className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-xl font-bold">Creator Application</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon />
          </button>
        </header>

        <main className="p-6 space-y-4">
          <p className="text-sm text-gray-300">
            Congratulations on meeting the criteria! Tell us a bit about the content you plan to create.
          </p>
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="e.g., I plan to stream cooking tutorials and share my favorite recipes!"
              className="w-full p-2 bg-zinc-700 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </main>

        <footer className="p-4 border-t border-zinc-700">
          <button
            onClick={handleSubmit}
            className="w-full py-3 font-semibold rounded-lg bg-pink-600 hover:bg-pink-700 transition-colors"
          >
            Submit Application
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ApplyCreatorModal;