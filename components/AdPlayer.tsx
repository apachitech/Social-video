

import React, { useRef, useEffect, useState } from 'react';
import { Ad, AdSettings } from '../types';
import { PlayIcon, VolumeUpIcon, VolumeOffIcon, ShareIcon, FullScreenIcon } from './icons/Icons';

interface AdPlayerProps {
    ad: Ad;
    isActive: boolean;
    adSettings: AdSettings;
    onSkip: () => void;
}

const AdPlayer: React.FC<AdPlayerProps> = ({ ad, isActive, adSettings, onSkip }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(1);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const volumeSliderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [canSkip, setCanSkip] = useState(false);

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().then(() => {
                setIsPlaying(true);
            }).catch(() => {
                setIsPlaying(false);
            });
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    }, [isActive]);
    
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
            videoRef.current.volume = volume;
        }
    }, [isMuted, volume]);

    useEffect(() => {
        const handleFullScreenChange = () => {
            const isCurrentlyFullScreen = document.fullscreenElement === containerRef.current;
            setIsFullScreen(isCurrentlyFullScreen);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    useEffect(() => {
        setCanSkip(false);
        if (isActive && adSettings.isSkippable) {
            const timer = setTimeout(() => {
                setCanSkip(true);
            }, adSettings.skipDelaySeconds * 1000);
            return () => clearTimeout(timer);
        }
    }, [isActive, adSettings.isSkippable, adSettings.skipDelaySeconds, ad.id]);


    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };
    
    const handleAdClick = () => {
        window.open(ad.content.linkUrl, '_blank', 'noopener,noreferrer');
    };

    const toggleMute = () => {
        if (isMuted && volume === 0) {
            setVolume(1);
        }
        setIsMuted(prev => !prev);

        setShowVolumeSlider(true);
        if (volumeSliderTimeout.current) clearTimeout(volumeSliderTimeout.current);
        volumeSliderTimeout.current = setTimeout(() => setShowVolumeSlider(false), 3000);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        
        if (volumeSliderTimeout.current) clearTimeout(volumeSliderTimeout.current);
        volumeSliderTimeout.current = setTimeout(() => setShowVolumeSlider(false), 3000);
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSharing) return;
        
        setIsSharing(true);
        try {
            await navigator.clipboard.writeText(ad.content.linkUrl);
            alert('Ad link copied to clipboard!');
        } catch (error) {
            console.error('Error copying link:', error);
            alert('Could not copy link to clipboard.');
        } finally {
            setIsSharing(false);
        }
    };

    const toggleFullScreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };


    if (!ad.content.videoUrl) {
        return (
             <div className="relative w-full h-full snap-start bg-zinc-800 flex items-center justify-center text-red-500" data-video-id={ad.id}>
                Error: Ad content is missing a video URL.
            </div>
        )
    }

    return (
        <div ref={containerRef} className="relative w-full h-full snap-start bg-black" data-video-id={ad.id}>
            <video
                ref={videoRef}
                src={ad.content.videoUrl}
                loop={!adSettings.isSkippable}
                onEnded={onSkip}
                playsInline
                className="w-full h-full object-cover"
                onClick={togglePlay}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>

            <div className="absolute top-4 left-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-md">Sponsored</div>
            
            {adSettings.isSkippable && canSkip && (
                <button
                    onClick={(e) => { e.stopPropagation(); onSkip(); }}
                    className="absolute top-16 right-4 bg-black/50 text-white text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm animate-fade-in-up pointer-events-auto"
                >
                    Skip Ad
                </button>
            )}

            <div className="absolute right-2 bottom-48 flex items-end space-x-2 text-white pointer-events-auto">
                {showVolumeSlider && (
                    <div className="bg-black/50 rounded-full h-24 w-8 flex items-center justify-center p-2 animate-fade-in-fast">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            onClick={e => e.stopPropagation()}
                            className="w-2 h-full appearance-none bg-transparent 
                                        [&::-webkit-slider-runnable-track]:bg-white/30 
                                        [&::-webkit-slider-runnable-track]:rounded-full
                                        [&::-webkit-slider-thumb]:appearance-none 
                                        [&::-webkit-slider-thumb]:h-4 
                                        [&::-webkit-slider-thumb]:w-4 
                                        [&::-webkit-slider-thumb]:rounded-full 
                                        [&::-webkit-slider-thumb]:bg-white
                                        cursor-pointer"
                            style={{ writingMode: 'vertical-lr' }}
                        />
                    </div>
                )}
                <div className="flex flex-col items-center space-y-5">
                    <button onClick={handleShare} disabled={isSharing} className="flex flex-col items-center disabled:opacity-50">
                        <ShareIcon className="w-8 h-8" />
                        <span className="text-xs font-semibold mt-1">Share</span>
                    </button>
                    <button onClick={toggleFullScreen} className="flex flex-col items-center">
                        <FullScreenIcon isFullScreen={isFullScreen} className="w-8 h-8" />
                        <span className="text-xs font-semibold mt-1">{isFullScreen ? 'Exit' : 'Full'}</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="flex flex-col items-center">
                        {isMuted ? <VolumeOffIcon className="w-8 h-8" /> : <VolumeUpIcon className="w-8 h-8" />}
                        <span className="text-xs font-semibold mt-1">{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 pointer-events-none">
                <div className="p-4 bg-black/50 rounded-lg backdrop-blur-sm pointer-events-auto" onClick={e => e.stopPropagation()}>
                    <p className="font-bold text-white">{ad.name}</p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleAdClick(); }}
                        className="mt-2 w-full py-3 font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg text-sm"
                    >
                        {ad.ctaText}
                    </button>
                </div>
            </div>

            {!isPlaying && (
                 <div className="absolute inset-0 flex items-center justify-center" onClick={togglePlay}>
                    <div className="bg-black/50 p-4 rounded-full pointer-events-auto" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                        <PlayIcon className="w-12 h-12 text-white" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdPlayer;