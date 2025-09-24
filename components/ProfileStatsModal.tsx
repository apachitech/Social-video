
import React, { useState, useMemo, useEffect } from 'react';
import { User, Video } from '../types';
import { CloseIcon, SearchIcon } from './icons/Icons';
import { supabase } from '../services/supabase';

type Tab = 'followers' | 'following' | 'likes';

interface ProfileStatsModalProps {
    user: User;
    initialTab: Tab;
    currentUser: User;
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
    user, initialTab, currentUser, onClose, onToggleFollow, onViewProfile, onOpenProfileVideoFeed
}) => {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [followersList, setFollowersList] = useState<User[]>([]);
    const [followingList, setFollowingList] = useState<User[]>([]);
    const [likedVideosList, setLikedVideosList] = useState<Video[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (activeTab === 'followers') {
                const { data, error } = await supabase
                    .from('followers')
                    .select('follower:profiles!follower_id(*)')
                    .eq('following_id', user.id);
                if (error) console.error('Error fetching followers:', error);
                else setFollowersList(data?.map(d => d.follower) as User[] || []);
            } else if (activeTab === 'following') {
                const { data, error } = await supabase
                    .from('followers')
                    .select('following:profiles!following_id(*)')
                    .eq('follower_id', user.id);
                if (error) console.error('Error fetching following:', error);
                else setFollowingList(data?.map(d => d.following) as User[] || []);
            } else if (activeTab === 'likes') {
                const { data, error } = await supabase
                    .from('likes')
                    .select('video:videos!inner(*, profile:profiles(username, avatar_url))')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (error) console.error('Error fetching liked videos:', error);
                else setLikedVideosList(data?.map(d => d.video) as Video[] || []);
            }
            setIsLoading(false);
        };

        fetchData();
    }, [user.id, activeTab]);

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

        if (isLoading) {
            return <div className="text-center p-8 text-gray-400">Loading...</div>;
        }

        if (filteredUsers.length === 0 && !searchTerm) {
            return <div className="text-center p-8 text-gray-400">No users to show.</div>;
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
                        {isLoading && activeTab !== 'followers' ? user.followers : followersList.length} Followers
                    </button>
                    <button onClick={() => setActiveTab('following')} className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'following' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}>
                        {isLoading && activeTab !== 'following' ? user.following : followingList.length} Following
                    </button>
                    <button onClick={() => setActiveTab('likes')} className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'likes' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}>
                        {isLoading && activeTab !== 'likes' ? user.totalLikes : likedVideosList.length} Likes
                    </button>
                </nav>

                {activeTab !== 'likes' && (
                    <div className="flex-shrink-0 p-2 border-b border-zinc-700">
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
