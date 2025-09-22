import React, { useMemo } from 'react';
import { User, Video } from '../../types';
import { ChevronLeftIcon, UsersIcon, VideoIcon, FlameIcon } from '../icons/Icons';
import { MonetizationSettings } from '../../types';

interface BecomeCreatorViewProps {
  user: User;
  videos: Video[];
  onBack: () => void;
  onApply: () => void;
  criteria: MonetizationSettings['creatorCriteria'];
  hasPendingApplication: boolean;
}

const CriteriaItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    current: number;
    goal: number;
    isMet: boolean;
}> = ({ icon, title, description, current, goal, isMet }) => (
    <div className={`p-4 rounded-lg flex items-center gap-4 transition-all ${isMet ? 'bg-green-900/50 border-green-500' : 'bg-zinc-800 border-zinc-700'} border`}>
        <div className={`p-3 rounded-full ${isMet ? 'bg-green-500/20' : 'bg-zinc-700'}`}>
            {icon}
        </div>
        <div className="flex-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-xs text-gray-400">{description}</p>
        </div>
        <div className="text-right">
            <p className={`font-bold ${isMet ? 'text-green-400' : ''}`}>{current.toLocaleString()} / {goal.toLocaleString()}</p>
            <div className="w-24 bg-zinc-700 rounded-full h-1.5 mt-1">
                <div className={`h-1.5 rounded-full ${isMet ? 'bg-green-500' : 'bg-pink-500'}`} style={{ width: `${Math.min((current/goal)*100, 100)}%`}}></div>
            </div>
        </div>
    </div>
);


const BecomeCreatorView: React.FC<BecomeCreatorViewProps> = ({ user, videos, onBack, onApply, criteria, hasPendingApplication }) => {
    
    const userStats = useMemo(() => {
        const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
        const videoCount = videos.length;
        const followers = user.followers || 0;
        const streak = user.streakCount || 0;
        return { totalViews, videoCount, followers, streak };
    }, [videos, user]);

    const criteriaMet = {
        followers: userStats.followers >= criteria.minFollowers,
        views: userStats.totalViews >= criteria.minViews,
        videos: userStats.videoCount >= criteria.minVideos,
    };
    
    const allCriteriaMet = Object.values(criteriaMet).every(Boolean);

    return (
        <div className="h-full w-full bg-zinc-900 text-white flex flex-col">
            <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
                <button onClick={onBack} className="mr-4">
                    <ChevronLeftIcon />
                </button>
                <h1 className="text-lg font-bold">Become a Creator</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Join the Creator Program!</h2>
                    <p className="text-gray-400 mt-2 max-w-md mx-auto">
                        Unlock monetization features, get a creator badge, and access exclusive tools by meeting the criteria below.
                    </p>
                </div>
                
                <div className="space-y-3">
                    <CriteriaItem 
                        icon={<UsersIcon className={`w-5 h-5 ${criteriaMet.followers ? 'text-green-400' : 'text-pink-400'}`} />}
                        title="Followers"
                        description="Grow your community."
                        current={userStats.followers}
                        goal={criteria.minFollowers}
                        isMet={criteriaMet.followers}
                    />
                    <CriteriaItem 
                        icon={<VideoIcon className={`w-5 h-5 ${criteriaMet.views ? 'text-green-400' : 'text-pink-400'}`} />}
                        title="Total Video Views"
                        description="Get your content seen."
                        current={userStats.totalViews}
                        goal={criteria.minViews}
                        isMet={criteriaMet.views}
                    />
                    <CriteriaItem 
                        icon={<FlameIcon className={`w-5 h-5 ${criteriaMet.videos ? 'text-green-400' : 'text-pink-400'}`} />}
                        title="Videos Uploaded"
                        description="Consistently post content."
                        current={userStats.videoCount}
                        goal={criteria.minVideos}
                        isMet={criteriaMet.videos}
                    />
                </div>

                <div className="pt-6 text-center">
                    {hasPendingApplication ? (
                         <div className="p-4 bg-yellow-900/50 border border-yellow-500 rounded-lg text-yellow-300">
                            <p className="font-semibold">Application Submitted</p>
                            <p className="text-sm">Your application is under review. We'll notify you soon!</p>
                        </div>
                    ) : (
                        <button
                            onClick={onApply}
                            disabled={!allCriteriaMet}
                            className="w-full max-w-xs mx-auto py-3 font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
                        >
                            {allCriteriaMet ? 'Apply Now' : 'Criteria Not Met'}
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BecomeCreatorView;