import React, { useState } from 'react';
import { CloseIcon, PinIcon, MoreVerticalIcon, MuteUserIcon, BanUserIcon, PollIcon, MicrophoneIcon, MicrophoneOffIcon, VideoIcon, VideoCameraOffIcon, VolumeUpIcon, VolumeOffIcon } from './icons/Icons';
import { User } from '../types';
import { BroadcastSource } from './views/LiveView';

interface ViewerActionModalProps {
    viewer: User;
    isMuted: boolean;
    onClose: () => void;
    onMuteToggle: () => void;
    onBan: () => void;
}

const ViewerActionModal: React.FC<ViewerActionModalProps> = ({ viewer, isMuted, onClose, onMuteToggle, onBan }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-[60] p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-xs text-white animate-fade-in-up" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-zinc-700 text-center">
                    <h3 className="font-bold">Actions for @{viewer.username}</h3>
                </div>
                <div className="flex flex-col">
                    <button onClick={onMuteToggle} className="flex items-center gap-3 p-4 text-left hover:bg-zinc-700 w-full transition-colors">
                        <MuteUserIcon className="w-5 h-5 text-yellow-400"/>
                        <span>{isMuted ? 'Unmute User' : 'Mute User'}</span>
                    </button>
                    <button onClick={onBan} className="flex items-center gap-3 p-4 text-left text-red-400 hover:bg-zinc-700 w-full transition-colors">
                        <BanUserIcon className="w-5 h-5"/>
                        <span>Ban User</span>
                    </button>
                     <button onClick={onClose} className="p-3 text-center border-t border-zinc-700 text-gray-300 font-semibold hover:bg-zinc-700 w-full transition-colors rounded-b-lg">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};


interface HostToolsModalProps {
  onClose: () => void;
  onSetPinnedMessage: (message: string) => void;
  pinnedMessage: string;
  events: { type: 'follow' | 'gift'; user: User; text: string }[];
  viewers: User[];
  onViewProfile: (user: User) => void;
  mutedUserIds: string[];
  onMuteUser: (userId: string) => void;
  onUnmuteUser: (userId: string) => void;
  onBanUser: (userId: string) => void;
  onOpenCreatePoll: () => void;
  sourceType: BroadcastSource;
  isMuted: boolean;
  onToggleMute: () => void;
  isVideoOff: boolean;
  onToggleVideo: () => void;
  isEmbed: boolean;
  isSourceMuted: boolean;
  onToggleSourceMute: () => void;
}

const HostToolsModal: React.FC<HostToolsModalProps> = ({ 
    onClose, onSetPinnedMessage, pinnedMessage, events, viewers, onViewProfile,
    mutedUserIds, onMuteUser, onUnmuteUser, onBanUser, onOpenCreatePoll,
    sourceType, isMuted, onToggleMute, isVideoOff, onToggleVideo,
    isEmbed, isSourceMuted, onToggleSourceMute
}) => {
    const [message, setMessage] = useState(pinnedMessage);
    const [selectedViewerForAction, setSelectedViewerForAction] = useState<User | null>(null);

    const handlePin = () => {
        onSetPinnedMessage(message);
    };

    const handleClear = () => {
        setMessage('');
        onSetPinnedMessage('');
    };

    return (
        <>
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end z-50">
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-t-2xl shadow-xl w-full max-w-lg text-white relative animate-slide-in-up flex flex-col h-[70vh]">
                <header className="flex-shrink-0 flex justify-center items-center p-4 border-b border-zinc-800 relative">
                    <h2 className="font-bold">Host Tools</h2>
                    <button onClick={onClose} className="absolute right-4 text-gray-400 hover:text-white">
                        <CloseIcon />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Stream Controls */}
                    {(sourceType !== 'url' || isEmbed) && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                                {sourceType === 'camera' ? 'Stream Controls' : 'Broadcast Controls'}
                            </h3>
                            <div className="bg-zinc-800 p-2 rounded-lg flex justify-around">
                                {sourceType === 'camera' && (
                                    <>
                                        <button
                                            onClick={onToggleMute}
                                            className={`flex flex-col items-center gap-1 p-2 rounded-md w-24 transition-colors ${
                                                isMuted ? 'bg-red-600/50 text-red-300' : 'hover:bg-zinc-700'
                                            }`}
                                        >
                                            {isMuted ? <MicrophoneOffIcon className="w-6 h-6"/> : <MicrophoneIcon className="w-6 h-6"/>}
                                            <span className="text-xs font-semibold">{isMuted ? 'Unmute' : 'Mute Mic'}</span>
                                        </button>
                                        <button
                                            onClick={onToggleVideo}
                                            className={`flex flex-col items-center gap-1 p-2 rounded-md w-24 transition-colors ${
                                                isVideoOff ? 'bg-red-600/50 text-red-300' : 'hover:bg-zinc-700'
                                            }`}
                                        >
                                            {isVideoOff ? <VideoCameraOffIcon className="w-6 h-6"/> : <VideoIcon className="w-6 h-6"/>}
                                            <span className="text-xs font-semibold">{isVideoOff ? 'Cam On' : 'Cam Off'}</span>
                                        </button>
                                    </>
                                )}
                                {(sourceType === 'video' || (sourceType === 'url' && isEmbed)) && (
                                     <button
                                        onClick={onToggleSourceMute}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-md w-24 transition-colors ${
                                            isSourceMuted ? 'bg-red-600/50 text-red-300' : 'hover:bg-zinc-700'
                                        }`}
                                    >
                                        {isSourceMuted ? <VolumeOffIcon className="w-6 h-6"/> : <VolumeUpIcon className="w-6 h-6"/>}
                                        <span className="text-xs font-semibold">{isSourceMuted ? 'Unmute Source' : 'Mute Source'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Pinned Message */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Pinned Message</h3>
                        <div className="bg-zinc-800 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                                <PinIcon className="text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Pin a message for everyone to see"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="flex-1 bg-transparent focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-3">
                                <button onClick={handleClear} className="px-3 py-1.5 text-xs font-semibold bg-zinc-700 rounded-md hover:bg-zinc-600 transition-colors">Clear</button>
                                <button onClick={handlePin} className="px-3 py-1.5 text-xs font-semibold bg-pink-600 rounded-md hover:bg-pink-700 transition-colors">Pin Message</button>
                            </div>
                        </div>
                    </div>

                    {/* Polls */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Polls</h3>
                        <div className="bg-zinc-800 p-4 rounded-lg">
                             <button 
                                onClick={onOpenCreatePoll}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold bg-pink-600 rounded-md hover:bg-pink-700 transition-colors"
                            >
                                <PollIcon className="w-5 h-5" />
                                Create New Poll
                            </button>
                        </div>
                    </div>
                    
                    {/* Recent Events */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Recent Events</h3>
                        <div className="bg-zinc-800 p-2 rounded-lg max-h-48 overflow-y-auto scrollbar-hide">
                            {events.length > 0 ? (
                                events.slice().reverse().map((event, index) => (
                                <div key={index} className="flex items-center p-2 text-sm">
                                    <img src={event.user.avatarUrl} alt={event.user.username} className="w-6 h-6 rounded-full mr-2" />
                                    <span>
                                        <span className="font-semibold text-pink-400">@{event.user.username}</span> {event.text}
                                    </span>
                                </div>
                            ))
                            ) : (
                                <p className="text-center text-gray-500 p-4 text-sm">No recent events.</p>
                            )}
                        </div>
                    </div>

                    {/* Viewers List */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Viewers ({viewers.length})</h3>
                         <div className="bg-zinc-800 p-2 rounded-lg max-h-48 overflow-y-auto scrollbar-hide">
                            {viewers.map(viewer => {
                                const isMuted = mutedUserIds.includes(viewer.id);
                                return (
                                <div key={viewer.id} className="flex items-center justify-between p-2 hover:bg-zinc-700/50 rounded-md">
                                    <button onClick={() => onViewProfile(viewer)} className="flex items-center text-left">
                                        <img src={viewer.avatarUrl} alt={viewer.username} className="w-8 h-8 rounded-full mr-3" />
                                        <div>
                                            <p className="font-semibold text-sm flex items-center gap-2">
                                                @{viewer.username}
                                                {isMuted && <span title="Muted"><MuteUserIcon className="w-4 h-4 text-yellow-500" /></span>}
                                            </p>
                                            <p className="text-xs text-gray-400">Level {viewer.level}</p>
                                        </div>
                                    </button>
                                    <button onClick={() => setSelectedViewerForAction(viewer)} className="p-1 text-gray-400 hover:text-white">
                                        <MoreVerticalIcon />
                                    </button>
                                </div>
                            )})}
                        </div>
                    </div>
                </main>
            </div>
        </div>
        
        {selectedViewerForAction && (
            <ViewerActionModal
                viewer={selectedViewerForAction}
                isMuted={mutedUserIds.includes(selectedViewerForAction.id)}
                onClose={() => setSelectedViewerForAction(null)}
                onMuteToggle={() => {
                    if (mutedUserIds.includes(selectedViewerForAction.id)) {
                        onUnmuteUser(selectedViewerForAction.id);
                    } else {
                        onMuteUser(selectedViewerForAction.id);
                    }
                    setSelectedViewerForAction(null);
                }}
                onBan={() => {
                    onBanUser(selectedViewerForAction.id);
                    setSelectedViewerForAction(null);
                }}
            />
        )}
        </>
    );
};

export default HostToolsModal;