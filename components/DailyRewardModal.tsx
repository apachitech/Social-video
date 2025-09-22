import React from 'react';
import { CloseIcon, CoinIcon } from './icons/Icons';
import { DailyRewardSettings } from '../types';

interface DailyRewardModalProps {
  streakCount: number;
  onClaim: () => void;
  onClose: () => void;
  dailyRewardSettings: DailyRewardSettings;
}

const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ streakCount, onClaim, onClose, dailyRewardSettings }) => {
  const { modalTitle, modalSubtitle, rewards } = dailyRewardSettings;
  const currentStreakIndex = streakCount; // 0-indexed for the upcoming reward
  const nextRewardIndex = Math.min(currentStreakIndex, rewards.length - 1);
  const rewardTier = rewards[nextRewardIndex];
  const rewardAmount = rewardTier ? rewardTier.amount : 0;

  const handleClaim = () => {
    onClaim();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-sm text-white relative animate-fade-in-up border-2 border-yellow-400/50">
        <div className="p-6 flex flex-col items-center text-center">
          <span className="text-6xl mb-4">🎁</span>
          <h2 className="text-2xl font-bold text-yellow-300">{modalTitle}</h2>
          <p className="text-gray-300 mt-2">
            You're on a <span className="font-bold text-orange-400">{streakCount + 1}-day</span> streak!
          </p>
          <p className="text-gray-400 text-sm">{modalSubtitle}</p>
          
          <div className="grid grid-cols-4 gap-2 my-6 w-full">
            {rewards.slice(0, 7).map((reward, index) => { // Show up to 7 days
                const isClaimed = index < currentStreakIndex;
                const isCurrent = index === currentStreakIndex;
                return (
                    <div key={index} className={`p-2 rounded-lg text-center ${isCurrent ? 'bg-yellow-500/30 border-2 border-yellow-400' : isClaimed ? 'bg-zinc-700 opacity-50' : 'bg-zinc-700'}`}>
                        <p className="text-xs text-gray-400">Day {index + 1}</p>
                        <div className="flex items-center justify-center font-bold text-yellow-400 text-base">
                            <CoinIcon className="w-4 h-4 mr-1" />
                            {reward.amount}
                        </div>
                    </div>
                )
            })}
          </div>

          <div className="my-6">
            <p className="text-sm text-gray-400">Today's Reward</p>
            <div className="flex items-center justify-center text-3xl font-bold text-yellow-400 mt-1">
              <CoinIcon className="w-8 h-8 mr-2" />
              <span>{rewardAmount}</span>
            </div>
          </div>
          
          <div className="w-full mt-2">
            <button 
              onClick={handleClaim} 
              className="w-full py-3 font-semibold rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg transform hover:scale-105 transition-transform"
            >
              Claim Reward
            </button>
            <button onClick={onClose} className="w-full mt-3 text-gray-400 text-sm hover:text-white">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyRewardModal;