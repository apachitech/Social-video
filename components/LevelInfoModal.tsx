import React from 'react';
import { User } from '../types';
import { CloseIcon, StarIcon } from './icons/Icons';

interface LevelInfoModalProps {
  user: User;
  onClose: () => void;
}

const LevelInfoModal: React.FC<LevelInfoModalProps> = ({ user, onClose }) => {
    const level = user.level || 1;
    const xp = user.xp || 0;
    const xpForNextLevel = level * 200;
    const xpProgress = (xp / xpForNextLevel) * 100;

    const rewards: { [key: number]: string } = {
        5: "Bronze Profile Frame 🥉",
        10: "Silver Profile Frame 🥈",
        20: "Gold Profile Frame 🥇",
        30: "Diamond Profile Frame 💎",
        50: "Exclusive 'Legend' Badge 🌟",
    };

    const nextRewardLevel = Object.keys(rewards).map(Number).find(lvl => lvl > level) || (level + 1);
    const nextReward = rewards[nextRewardLevel] || "More Coins!";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-sm text-white relative animate-fade-in-up border border-purple-500/50">
                <header className="flex items-center justify-between p-4 border-b border-zinc-700">
                    <h2 className="text-lg font-bold">Your Level</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon />
                    </button>
                </header>
                <main className="p-6">
                    <div className="text-center mb-6">
                        <div className="inline-block p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full">
                            <StarIcon className="w-10 h-10" />
                        </div>
                        <p className="text-4xl font-bold mt-2">Level {level}</p>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center text-sm font-semibold mb-1 text-gray-300">
                            <span>PROGRESS</span>
                            <span>{xp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-3">
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full" style={{ width: `${xpProgress}%` }}></div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">How to Earn XP</h3>
                        <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                            <li>Watching videos</li>
                            <li>Sending & Receiving gifts</li>
                            <li>Daily check-ins & streaks</li>
                            <li>Engaging with the community</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Next Reward</h3>
                        <div className="bg-zinc-700/50 p-3 rounded-lg text-center">
                            <p className="text-purple-300 font-bold">Level {nextRewardLevel}: <span className="text-white">{nextReward}</span></p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LevelInfoModal;