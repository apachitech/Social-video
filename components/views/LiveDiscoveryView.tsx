import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LiveStream, User, Ad } from '../../types';
import ViewerLiveView from './ViewerLiveView'; 
import { SearchIcon, TasksIcon, ChevronRightIcon } from '../icons/Icons';
import { View } from '../../App';

interface LiveDiscoveryViewProps {
  liveStreams: LiveStream[];
  onGoLive: () => void;
  setIsNavVisible: (visible: boolean) => void;
  currentUser: User;
  onToggleFollow: (userId: string) => void;
  onShareStream: (streamId: string) => void;
  onViewProfile: (user: User) => void;
  bannerAds: Ad[];
  onBanStreamer: (streamerId: string) => void;
  hasIncompleteDailyTasks: boolean;
  onNavigate: (view: View) => void;
}

const LiveCard: React.FC<{ stream: LiveStream; onClick: () => void }> = ({ stream, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if the video URL is a direct link that can be played in a <video> tag
  const canPreview = useMemo(() => 
    stream.videoUrl && !stream.videoUrl.includes('youtube.com') && !stream.videoUrl.includes('youtu.be'),
    [stream.videoUrl]
  );

  useEffect(() => {
    // We only want to play the video if it's visible (isHovered and canPreview are true)
    if (isHovered && canPreview && videoRef.current) {
      videoRef.current.play().catch(error => {
        // Autoplay can be blocked by browsers, this is expected behavior.
        console.warn("Video preview autoplay failed:", error.message);
      });
    } else if (videoRef.current) {
      // Pause and rewind when not hovered
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, canPreview]);

  return (
    <div 
      className="relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer group bg-zinc-800" 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail Image - always present for fallback and initial view */}
      <img 
        src={stream.thumbnailUrl} 
        alt={stream.title} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
      />
      
      {/* Video Preview - conditionally rendered and fades in on hover */}
      {canPreview && (
        <video
          ref={videoRef}
          src={stream.videoUrl}
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded z-10">LIVE</div>
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded z-10">{stream.viewers.toLocaleString()} watching</div>
      <div className="absolute bottom-0 left-0 p-3 text-white z-10">
        <p className="font-bold">{stream.title}</p>
        <div className="flex items-center mt-1">
          <img src={stream.user.avatarUrl} alt={stream.user.username} className="w-6 h-6 rounded-full border-2 border-white" />
          <p className="text-sm ml-2">@{stream.user.username}</p>
        </div>
      </div>
    </div>
  );
};

const LiveDiscoveryView: React.FC<LiveDiscoveryViewProps> = ({ liveStreams, onGoLive, setIsNavVisible, currentUser, onToggleFollow, onShareStream, onViewProfile, bannerAds, onBanStreamer, hasIncompleteDailyTasks, onNavigate }) => {
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Hide the nav when a stream is selected, show it when back on the discovery view.
    setIsNavVisible(selectedStreamId === null);
  }, [selectedStreamId, setIsNavVisible]);

  const filteredAndActiveStreams = liveStreams.filter(stream =>
    stream.status === 'live' &&
    (stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stream.user.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const selectedStream = useMemo(() => 
    liveStreams.find(s => s.id === selectedStreamId), 
  [liveStreams, selectedStreamId]);

  if (selectedStream) {
    return <ViewerLiveView 
            stream={selectedStream} 
            onBack={() => setSelectedStreamId(null)} 
            currentUser={currentUser}
            onToggleFollow={onToggleFollow}
            onShareStream={onShareStream}
            onViewProfile={onViewProfile}
            bannerAds={bannerAds}
            onBanStreamer={onBanStreamer}
            hasIncompleteDailyTasks={hasIncompleteDailyTasks}
            onNavigate={onNavigate}
          />;
  }

  return (
    <div className="h-full w-full bg-zinc-900 text-white overflow-y-auto pb-16">
      <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center justify-between p-4 border-b border-zinc-800">
        <h1 className="text-lg font-bold">Live Discovery</h1>
        <button 
          onClick={onGoLive}
          className="px-4 py-2 font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg text-sm"
        >
          Go Live
        </button>
      </header>
      
      <div className="p-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search streams..."
            aria-label="Search live streams by title or username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {hasIncompleteDailyTasks && (
            <div className="mb-4">
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
        
        {/* Live Stream Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredAndActiveStreams.length > 0 ? (
            filteredAndActiveStreams.map(stream => (
              <LiveCard key={stream.id} stream={stream} onClick={() => setSelectedStreamId(stream.id)} />
            ))
          ) : (
            <div className="col-span-2 sm:col-span-3 md:col-span-4 text-center text-gray-400 py-10">
                <p className="font-semibold">No Results</p>
                <p className="text-sm">No live streams found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDiscoveryView;