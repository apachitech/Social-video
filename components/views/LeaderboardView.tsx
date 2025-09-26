import React, { useState } from 'react';
import { LeaderboardUser } from '../../types';
import { mockTopGifters, mockTopEarners } from '../../services/mockApi';
import { ChevronLeftIcon, CoinIcon } from '../icons/Icons';

interface LeaderboardViewProps {
  onBack: () => void;
}

const LeaderboardRow: React.FC<{ item: LeaderboardUser; isCurrentUser: boolean }> = ({ item, isCurrentUser }) => {
    const rankColor = 
        item.rank === 1 ? 'text-yellow-400' :
        item.rank === 2 ? 'text-gray-300' :
        item.rank === 3 ? 'text-yellow-600' :
        'text-gray-400';

    const rankIcon = 
        item.rank === 1 ? '🥇' :
        item.rank === 2 ? '🥈' :
        item.rank === 3 ? '🥉' :
        item.rank;

    return (
        <div className={`flex items-center p-3 rounded-lg transition-colors ${isCurrentUser ? 'bg-pink-500/20' : 'hover:bg-zinc-800'}`}>
            <div className={`w-8 text-center font-bold text-lg ${rankColor}`}>{rankIcon}</div>
            <img src={item.user.avatarUrl} alt={item.user.username} className="w-12 h-12 rounded-full mx-4 border-2 border-zinc-600" />
            <div className="flex-1">
                <p className="font-bold">@{item.user.username}</p>
                <p className="text-xs text-gray-400">Level {item.user.level}</p>
            </div>
            <div className="font-bold flex items-center text-yellow-400">
                <CoinIcon className="w-4 h-4 mr-1" />
                {item.score.toLocaleString()}
            </div>
        </div>
    );
};


const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'gifters' | 'earners'>('gifters');

  const data = activeTab === 'gifters' ? mockTopGifters : mockTopEarners;
  const title = activeTab === 'gifters' ? 'Top Gifters' : 'Top Earners';

  return (
    <div className="h-full w-full bg-zinc-900 text-white flex flex-col">
      <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
        <button onClick={onBack} className="mr-4">
          <ChevronLeftIcon />
        </button>
        <h1 className="text-lg font-bold">Weekly Leaderboard</h1>
      </header>
      
      <nav className="flex p-1 bg-zinc-800 m-4 rounded-lg">
        <button 
          onClick={() => setActiveTab('gifters')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'gifters' ? 'bg-pink-600' : 'text-gray-300'}`}
        >
          Top Gifters
        </button>
        <button 
          onClick={() => setActiveTab('earners')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'earners' ? 'bg-pink-600' : 'text-gray-300'}`}
        >
          Top Earners
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto px-4 pb-16">
        <p className="text-xs text-gray-500 text-center mb-2">Resets in 3 days</p>
        <div className="space-y-2">
            {data.map(item => (
                <LeaderboardRow key={item.rank} item={item} isCurrentUser={item.user.id === 'u1'} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardView;
