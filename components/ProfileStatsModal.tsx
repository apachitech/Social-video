
import React, { useState, useMemo } from 'react';
import { User, Video } from '../types';
import { CloseIcon, SearchIcon } from './icons/Icons';

type Tab = 'followers' | 'following' | 'likes';

interface ProfileStatsModalProps {
    user: User;
    initialTab: Tab;
    currentUser: User;
    allUsers: User[];
    allVideos: Video[];
    onClose: () => void;
    onToggleFollow: (userId: string) => void;
    onViewProfile: (user: User) => void;
    onOpenProfileVideoFeed: (videos: Video[], startIndex: number) => void;
}

const UserListItem: React.FC<{
    userToList: User;
    currentUser: User;
    onToggleFollow: (userId: string) => void;
    onViewProfile: (user: User) => void;
}> = ({ userToList, currentUser, onToggleFollow, onViewProfile }) => {
    const isCurrentUser = userToList.id === currentUser.id;
    const isFollowing = currentUser.followingIds?.includes(userToList.id);

    return (
        <div className="flex items-center p-2 hover:bg-zinc-700/50 rounded-lg">
            <button onClick={() => onViewProfile(userToList)} className="flex items-center flex-1 gap-3">
                <img src={userToList.avatarUrl} alt={userToList.username} className="w-12 h-12 rounded-full" />
                <div className="text-left">
                    <p className="font-bold">@{userToList.username}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{userToList.bio || 'No bio yet.'}</p>
                </div>
            </button>
            {!isCurrentUser && (
                <button
                    onClick={() => onToggleFollow(userToList.id)}
                    className={`ml-4 px-4 py-1.5 text-sm font-bold rounded-md transition-colors shrink-0 ${
                        isFollowing ? 'bg-zinc-700 text-white' : 'bg-white text-black'
                    }`}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
            )}
        </div>
    );
};

const ProfileStatsModal: React.FC<ProfileStatsModalProps> = ({
    user, initialTab, currentUser, allUsers, allVideos, onClose, onToggleFollow, onViewProfile, onOpenProfileVideoFeed
}) => {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [searchTerm, setSearchTerm] = useState('');

    const followingList = useMemo(() => allUsers.filter(u => user.followingIds?.includes(u.id)), [allUsers, user.followingIds]);
    const followersList = useMemo(() => allUsers.filter(u => u.followingIds?.includes(user.id)), [allUsers, user.id]);
    const likedVideosList = useMemo(() => allVideos.filter(v => user.likedVideoIds?.includes(v.id)), [allVideos, user.likedVideoIds]);

    const filteredUsers = useMemo(() => {
        const listToFilter = activeTab === 'followers' ? followersList : followingList;
        if (!searchTerm) return listToFilter;
        return listToFilter.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [activeTab, followersList, followingList, searchTerm]);

    const renderContent = () => {
        if (activeTab === 'likes') {
            return (
                <div className="grid grid-cols-3 gap-0.5">
                    {likedVideosList.map((video, index) => (
                        <button
                            key={video.id}
                            onClick={() => onOpenProfileVideoFeed(likedVideosList, index)}
                            className="aspect-square bg-zinc-800 relative group focus:outline-none focus:ring-1 focus:ring-pink-500"
                        >
                            <img src={video.thumbnailUrl} alt={video.description} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            );
        }
        return (
            <div className="p-2 space-y-1">
                {filteredUsers.map(u => (
                    <UserListItem
                        key={u.id}
                        userToList={u}
                        currentUser={currentUser}
                        onToggleFollow={onToggleFollow}
                        onViewProfile={onViewProfile}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-end z-50">
            <div className="bg-zinc-800 rounded-t-2xl shadow-xl w-full max-w-lg text-white relative animate-slide-in-up flex flex-col h-[70vh]">
                <header className="flex-shrink-0 flex justify-center items-center p-4 border-b border-zinc-700 relative">
                    <h2 className="font-bold text-lg">@{user.username}</h2>
                    <button onClick={onClose} className="absolute right-4 text-gray-400 hover:text-white">
                        <CloseIcon />
                    </button>
                </header>
                
                <nav className="flex-shrink-0 flex border-b border-zinc-700">
                    <button onClick={() => setActiveTab('followers')} className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'followers' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}>
                        {user.followers} Followers
                    </button>
                    <button onClick={() => setActiveTab('following')} className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'following' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}>
                        {user.following} Following
                    </button>
                    <button onClick={() => setActiveTab('likes')} className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'likes' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}>
                        {user.totalLikes} Likes
                    </button>
                </nav>

                {activeTab !== 'likes' && (
                    <div className="flex-shrink-0 p-2">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-zinc-700 focus:outline-none focus:ring-1 focus:ring-pink-500"
                            />
                        </div>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default ProfileStatsModal;
