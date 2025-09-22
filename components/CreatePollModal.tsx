import React, { useState } from 'react';
import { Poll } from '../types';
import { CloseIcon, PlusCircleIcon } from './icons/Icons';

interface CreatePollModalProps {
  onClose: () => void;
  onLaunchPoll: (pollData: Omit<Poll, 'totalVotes'>) => void;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({ onClose, onLaunchPoll }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const canLaunch = question.trim() !== '' && options.every(opt => opt.trim() !== '') && options.length >= 2;

  const handleLaunch = () => {
    if (!canLaunch) return;
    onLaunchPoll({
      question,
      options: options.map((opt, index) => ({ id: `opt-${index}`, text: opt, votes: 0 })),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-sm text-white relative animate-fade-in-up flex flex-col max-h-[90vh]">
        <header className="flex items-center justify-between p-4 border-b border-zinc-700 flex-shrink-0">
          <h2 className="text-lg font-bold">Create a Poll</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon />
          </button>
        </header>

        <main className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="poll-question" className="block text-sm font-medium text-gray-400 mb-1">
              Question
            </label>
            <input
              id="poll-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What should we do next?"
              className="w-full p-2 bg-zinc-700 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Options</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={25}
                    className="w-full p-2 bg-zinc-700 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <CloseIcon className="w-5 h-5"/>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {options.length < 4 && (
            <button
              onClick={addOption}
              className="flex items-center gap-2 text-sm font-semibold text-pink-400 hover:text-pink-300"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Add Option
            </button>
          )}
        </main>
        
        <footer className="p-4 border-t border-zinc-700 flex-shrink-0">
            <button
              onClick={handleLaunch}
              disabled={!canLaunch}
              className="w-full py-3 font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform"
            >
              Launch Poll
            </button>
        </footer>
      </div>
    </div>
  );
};

export default CreatePollModal;