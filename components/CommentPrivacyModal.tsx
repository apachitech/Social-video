import React, { useState } from 'react';
import { CloseIcon, CheckCircleIcon } from './icons/Icons';

type CommentPrivacySetting = 'everyone' | 'following' | 'nobody';

interface CommentPrivacyModalProps {
  currentSetting: CommentPrivacySetting;
  onClose: () => void;
  onSave: (setting: CommentPrivacySetting) => void;
}

const options: { value: CommentPrivacySetting; title: string; description: string }[] = [
  { value: 'everyone', title: 'Everyone', description: 'Anyone can comment on your videos.' },
  { value: 'following', title: 'People you follow', description: 'Only users you follow can comment.' },
  { value: 'nobody', title: 'Nobody', description: 'Comments will be turned off on all your videos.' },
];

const CommentPrivacyModal: React.FC<CommentPrivacyModalProps> = ({ currentSetting, onClose, onSave }) => {
  const [selected, setSelected] = useState<CommentPrivacySetting>(currentSetting);

  const handleSave = () => {
    onSave(selected);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-end z-50">
      <div className="bg-zinc-900 rounded-t-2xl shadow-xl w-full max-w-lg text-white relative animate-slide-in-up flex flex-col h-auto">
        <header className="flex-shrink-0 flex justify-center items-center p-4 border-b border-zinc-800 relative">
          <h2 className="font-bold">Who can comment</h2>
          <button onClick={onClose} className="absolute right-4 text-gray-400 hover:text-white">
            <CloseIcon />
          </button>
        </header>

        <main className="p-4 space-y-3">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelected(option.value)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors flex justify-between items-start ${
                selected === option.value ? 'border-pink-500 bg-pink-500/10' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div>
                <p className="font-semibold">{option.title}</p>
                <p className="text-sm text-gray-400 mt-1">{option.description}</p>
              </div>
              {selected === option.value && <CheckCircleIcon className="w-6 h-6 text-pink-500 shrink-0 ml-4" />}
            </button>
          ))}
        </main>

        <footer className="p-4 border-t border-zinc-800">
          <button
            onClick={handleSave}
            className="w-full py-3 font-semibold rounded-lg bg-pink-600 hover:bg-pink-700 transition-colors"
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CommentPrivacyModal;