import React, { useState, useEffect, useRef } from 'react';
import { Task, Ad } from '../../types';
import { CloseIcon, VolumeUpIcon, VolumeOffIcon, PlayIcon, PauseIcon } from './icons/Icons';

interface WatchAdModalProps {
    task: Task;
    ad: Ad;
    onClose: () => void;
    onComplete: (task: Task) => void;
}

const CircularProgress: React.FC<{ progress: number; timeLeft: number; isComplete: boolean; onClick?: () => void }> = ({ progress, timeLeft, isComplete, onClick }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    const containerClasses = `relative w-14 h-14 bg-black/50 rounded-full flex items-center justify-center ${onClick ? 'cursor-pointer hover:scale-110 transition-transform' : 'pointer-events-none'}`;

    return (
        <button disabled={!onClick} onClick={onClick} className={containerClasses} aria-label={isComplete ? "Claim Reward" : `Time left: ${timeLeft} seconds`}>
            <svg className="w-full h-full" viewBox="0 0 52 52">
                <circle className="text-zinc-700" strokeWidth="3" stroke="currentColor" fill="transparent" r={radius} cx="26" cy="26" />
                <circle
                    className={isComplete ? "text-green-400" : "text-white"}
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="26"
                    cy="26"
                    transform="rotate(-90 26 26)"
                    style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {isComplete ? (
                    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                    <span className="font-bold text-lg">{timeLeft}</span>
                )}
            </div>
        </button>
    );
};


const WatchAdModal: React.FC<WatchAdModalProps> = ({ task, ad, onClose, onComplete }) => {
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(task.adDuration);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayPause, setShowPlayPause] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        video.currentTime = 0;
        video.play().catch(e => console.error("Ad autoplay failed:", e));
        
        setTimeLeft(task.adDuration);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (video) video.pause();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            if (video) {
                video.pause();
                video.removeEventListener('play', handlePlay);
                video.removeEventListener('pause', handlePause);
            }
        };
    }, [currentAdIndex, task.adDuration]);

    useEffect(() => {
        if(videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const handleNextAd = () => {
        if (currentAdIndex < task.adsToWatch - 1) {
            setCurrentAdIndex(prev => prev + 1);
        }
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setShowPlayPause(true);
        setTimeout(() => setShowPlayPause(false), 800);
    };

    const isCurrentAdComplete = timeLeft <= 0;
    const isTaskFullyComplete = isCurrentAdComplete && currentAdIndex === task.adsToWatch - 1;
    const progress = ((task.adDuration - timeLeft) / task.adDuration) * 100;

    const renderFooterButton = () => {
        if (isTaskFullyComplete) {
            return (
                <button
                    onClick={() => onComplete(task)}
                    className="w-full py-4 font-bold text-lg rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-lg animate-fade-in-up flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
                >
                    Claim Reward: +{task.rewardAmount.toLocaleString()} {task.rewardType === 'coins' ? 'Coins' : 'XP'}
                </button>
            );
        }
        if (isCurrentAdComplete) {
            return (
                 <button
                    onClick={handleNextAd}
                    className="w-full py-3 font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg animate-fade-in-up"
                >
                    Next Ad ({currentAdIndex + 2}/{task.adsToWatch})
                </button>
            );
        }
        return (
            <button
                disabled
                className="w-full py-3 font-semibold rounded-lg bg-zinc-700 text-gray-400 shadow-lg cursor-not-allowed"
            >
                Watch Ad to Claim
            </button>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 p-4">
            <div className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-sm text-white relative animate-fade-in-up flex flex-col max-h-[90vh] overflow-y-auto scrollbar-hide">
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-bold">{task.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon />
                    </button>
                </header>

                <main className="relative aspect-[9/16] bg-black flex-shrink-0">
                    {ad.content.videoUrl ? (
                        <video
                            ref={videoRef}
                            src={ad.content.videoUrl}
                            playsInline
                            className={`w-full h-full object-cover transition-opacity duration-500 ${isTaskFullyComplete ? 'opacity-20' : 'opacity-100'}`}
                            onClick={togglePlay}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-red-500">
                            Ad content could not be loaded.
                        </div>
                    )}
                    
                    {isTaskFullyComplete && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-center text-center p-4 animate-fade-in-fast pointer-events-none">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold mt-4">Task Complete!</h3>
                            <p className="text-gray-300 mt-1">Claim your reward below.</p>
                        </div>
                    )}

                    {showPlayPause && !isTaskFullyComplete && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black/50 p-4 rounded-full animate-fade-out">
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </div>
                        </div>
                    )}

                    <div className="absolute top-4 right-4 z-10">
                        <CircularProgress 
                            progress={progress} 
                            timeLeft={timeLeft} 
                            isComplete={isCurrentAdComplete}
                            onClick={isTaskFullyComplete ? () => onComplete(task) : undefined}
                         />
                    </div>

                     {task.adsToWatch > 1 && (
                         <div className="absolute top-6 left-4 bg-black/50 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                            Ad {currentAdIndex + 1} of {task.adsToWatch}
                        </div>
                    )}
                    
                    <button onClick={() => setIsMuted(prev => !prev)} className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-full text-white">
                        {isMuted ? <VolumeOffIcon className="w-6 h-6" /> : <VolumeUpIcon className="w-6 h-6" />}
                    </button>
                </main>

                <footer className="p-4 border-t border-zinc-800 flex-shrink-0">
                    <div className="text-center mb-4">
                        <p className="font-semibold">{ad.name}</p>
                        <a 
                            href={ad.content.linkUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-pink-400 hover:underline"
                        >
                            {ad.ctaText}
                        </a>
                    </div>
                    {renderFooterButton()}
                </footer>
            </div>
        </div>
    );
};

export default WatchAdModal;