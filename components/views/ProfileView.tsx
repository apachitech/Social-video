import React, { useState } from 'react';
import { User, Video, Ad } from '../../types';
import { View } from '../../App';
import { SettingsIcon, GridIcon, CoinIcon, FlameIcon, StarIcon, BadgeIcon, AdminPanelIcon, ChevronLeftIcon, CreatorDashboardIcon, LiveIcon, TasksIcon, ChevronRightIcon } from '../icons/Icons';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ProfileViewProps {
  user: User;
  currentUser: User;
  isOwnProfile: boolean;
  videos: Video[];
  onNavigate: (view: View) => void;
  onEditProfile: () => void;
  onBack?: () => void;
  onToggleFollow: (userId: string) => void;
  onGoLive: () => void;
  bannerAd?: Ad;
  onShareProfile: (username: string) => void;
  onOpenProfileVideoFeed: (videos: Video[], startIndex: number) => void;
  onOpenProfileStats: (user: User, initialTab: 'following' | 'followers' | 'likes') => void;
  onOpenLevelInfo: () => void;
  hasIncompleteDailyTasks: boolean;
}

const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="font-bold text-lg">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

const ProfileAdBanner: React.FC<{ ad: Ad }> = ({ ad }) => (
  <a
    href={ad.content.linkUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-zinc-800 rounded-lg p-3 shadow-lg flex items-center gap-4 relative cursor-pointer hover:bg-zinc-700 transition-colors w-full"
  >
    <img src={ad.content.imageUrl!} alt={ad.name} className="w-16 h-16 object-cover rounded-md" />
    <div className="flex-1 overflow-hidden">
        <p className="text-xs text-yellow-400">Sponsored</p>
        <p className="text-sm font-semibold text-white truncate">{ad.name}</p>
    </div>
    <span className="bg-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-pink-700 transition-colors shrink-0">
        {ad.ctaText}
    </span>
  </a>
);

const ProfileView: React.FC<ProfileViewProps> = ({ user, currentUser, isOwnProfile, videos, onNavigate, onEditProfile, onBack, onToggleFollow, onGoLive, bannerAd, onShareProfile, onOpenProfileVideoFeed, onOpenProfileStats, onOpenLevelInfo, hasIncompleteDailyTasks }) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'badges'>('videos');
  const formatCurrency = useCurrency();
  const userVideos = videos.filter(v => v.user.id === user.id);
  const isFollowing = currentUser.followingIds?.includes(user.id);

  return (
    <div className="h-full w-full bg-zinc-900 text-white overflow-y-auto pb-16">
      <header className="relative p-4 flex justify-end items-center space-x-4 max-w-2xl mx-auto">
        {onBack && (
            <button onClick={onBack} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 z-10">
                <ChevronLeftIcon />
            </button>
        )}
        
        {isOwnProfile ? (
          <>
            <button 
              onClick={() => onNavigate('wallet')} 
              className="flex items-center bg-zinc-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-zinc-700 transition-colors"
            >
              <CoinIcon className="w-5 h-5 text-yellow-400" />
              <span className="ml-2">{user.wallet?.balance.toLocaleString()}</span>
            </button>
            <button onClick={() => onNavigate('settings')}>
              <SettingsIcon />
            </button>
          </>
        ) : (
            <div className="w-16 h-8" /> // Placeholder for spacing
        )}
      </header>
      
      <div className="max-w-2xl mx-auto -mt-12 pt-12">
        <div className="flex flex-col items-center px-4">
          <img src={user.avatarUrl} alt={user.username} className="w-24 h-24 rounded-full object-cover border-4 border-zinc-800" />
          <div className="flex items-center gap-3 mt-3">
             <h1 className="text-xl font-bold">@{user.username}</h1>
             <button onClick={onOpenLevelInfo} className="bg-gradient-to-br from-purple-600 to-indigo-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 hover:opacity-90 transition-opacity">
                <StarIcon className="w-3 h-3"/>
                LVL {user.level || 1}
            </button>
          </div>
          
          <div className="flex items-center gap-2 mt-2 text-sm text-orange-400 bg-zinc-800 px-3 py-1 rounded-full">
              <FlameIcon />
              <span>{user.streakCount}-day Streak</span>
          </div>

          <p className="text-sm text-center text-gray-300 mt-3 max-w-sm">{user.bio}</p>
        </div>

        <div className="flex justify-center space-x-8 my-5">
          <button onClick={() => onOpenProfileStats(user, 'following')} className="hover:opacity-80 transition-opacity">
            <StatItem value={user.following?.toLocaleString() || '0'} label="Following" />
          </button>
          <button onClick={() => onOpenProfileStats(user, 'followers')} className="hover:opacity-80 transition-opacity">
            <StatItem value={user.followers?.toLocaleString() || '0'} label="Followers" />
          </button>
          <button onClick={() => onOpenProfileStats(user, 'likes')} className="hover:opacity-80 transition-opacity">
            <StatItem value={(user.totalLikes || 0).toLocaleString()} label="Likes" />
          </button>
        </div>

        <div className="px-4 flex space-x-2">
          {isOwnProfile ? (
            <>
              <button onClick={onEditProfile} className="flex-1 py-2 bg-zinc-700 rounded-md font-semibold text-sm">Edit profile</button>
              <button onClick={() => onShareProfile(user.username)} className="flex-1 py-2 bg-zinc-700 rounded-md font-semibold text-sm">Share profile</button>
            </>
          ) : (
             <>
                <button 
                  onClick={() => onToggleFollow(user.id)} 
                  className={`flex-1 py-2 rounded-md font-semibold text-sm transition-colors ${isFollowing ? 'bg-zinc-700 text-white' : 'bg-pink-600 text-white'}`}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button 
                  onClick={() => alert(`Start chat with ${user.username}`)} 
                  className="flex-1 py-2 bg-zinc-700 rounded-md font-semibold text-sm"
                >
                    Message
                </button>
            </>
          )}
        </div>
        
        {isOwnProfile && hasIncompleteDailyTasks && (
            <div className="px-4 mt-4">
                <button 
                    onClick={() => onNavigate('tasks')}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-lg flex justify-between items-center hover:opacity-90 transition-opacity animate-fade-in-up"
                >
                    <div className="flex items-center gap-3">
                        <TasksIcon className="w-6 h-6" />
                        <div>
                            <p className="font-bold text-left text-sm">Complete your daily tasks!</p>
                            <p className="text-xs text-purple-200 text-left">Earn free coins and XP.</p>
                        </div>
                    </div>
                    <ChevronRightIcon />
                </button>
            </div>
        )}

        {bannerAd && (
            <div className="px-4 mt-4">
                <ProfileAdBanner ad={bannerAd} />
            </div>
        )}

        {isOwnProfile && (user.role === 'creator' || user.role === 'admin') && (
          <div className="px-4 mt-4 grid grid-cols-2 gap-2">
            <button 
              onClick={() => onNavigate('creatorDashboard')}
              className="w-full py-2 bg-purple-600 rounded-md font-semibold text-sm flex items-center justify-center gap-2"
            >
              <CreatorDashboardIcon />
              Creator Dashboard
            </button>
             <button 
              onClick={onGoLive}
              className="w-full py-2 bg-red-600 rounded-md font-semibold text-sm flex items-center justify-center gap-2"
            >
              <LiveIcon className="w-5 h-5"/>
              Go Live
            </button>
          </div>
        )}

        {isOwnProfile && user.role === 'admin' && (
          <div className="px-4 mt-2">
            <button 
              onClick={() => onNavigate('admin')}
              className="w-full py-2 bg-pink-600 rounded-md font-semibold text-sm flex items-center justify-center gap-2"
            >
              <AdminPanelIcon />
              Admin Panel
            </button>
          </div>
        )}

        <div className="mt-6 border-b border-zinc-700 flex">
          <button 
            onClick={() => setActiveTab('videos')}
            className={`flex-1 py-3 flex justify-center items-center gap-2 text-sm ${activeTab === 'videos' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
          >
            <GridIcon />
            <span>Videos</span>
          </button>
          <button 
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-3 flex justify-center items-center gap-2 text-sm ${activeTab === 'badges' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
          >
            <BadgeIcon />
            <span>Badges</span>
          </button>
        </div>

        <div>
          {activeTab === 'videos' && (
            <div className="grid grid-cols-3">
              {userVideos.map((video, index) => (
                <button 
                  key={video.id} 
                  onClick={() => onOpenProfileVideoFeed(userVideos, index)}
                  className="aspect-square bg-zinc-800 relative group focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-inset"
                >
                  {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.description} className="w-full h-full object-cover" />
                  ) : (
                      <video src={video.videoSources[0]?.url} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="flex items-center gap-1 text-white font-bold text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path></svg>
                      <span>{video.views.toLocaleString()}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {activeTab === 'badges' && (
              <div className="p-4 grid grid-cols-3 gap-4">
                  {user.badges?.map(badge => (
                      <div key={badge.id} className="flex flex-col items-center text-center p-2 bg-zinc-800 rounded-lg">
                          <span className="text-4xl">{badge.icon}</span>
                          <p className="text-xs font-semibold mt-1">{badge.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                      </div>
                  ))}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;