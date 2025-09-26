import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Video, User, Ad } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, MusicIcon, PlayIcon, PauseIcon, FullScreenIcon, VolumeUpIcon, VolumeOffIcon, SettingsIcon } from './icons/Icons';
import { getYouTubeEmbedUrl } from '../utils/videoUtils';
import AdBannerOverlay from './AdBannerOverlay';

interface VideoPlayerProps {
  video: Video;
  isActive: boolean;
  onOpenComments: () => void;
  currentUser: User;
  onToggleFollow: (userId: string) => void;
  onShareVideo: (videoId: string) => void;
  onViewProfile: (user: User) => void;
  bannerAd?: Ad;
}

const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, isActive, onOpenComments, currentUser, onToggleFollow, onShareVideo, onViewProfile, bannerAd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlayPause, setShowPlayPause] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeSliderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [likeAnimation, setLikeAnimation] = useState<{ key: number, x: number, y: number } | null>(null);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef(0);

  const [currentQuality, setCurrentQuality] = useState(video.videoSources[0]?.quality || 'Auto');
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);

  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFollowing = currentUser.followingIds?.includes(video.user.id);
  const isOwnProfile = currentUser.id === video.user.id;
  
  const videoUrl = video.videoSources.find(s => s.quality === currentQuality)?.url || video.videoSources[0]?.url;
  const embedUrl = useMemo(() => videoUrl ? getYouTubeEmbedUrl(videoUrl, isMuted) : null, [videoUrl, isMuted]);
  
  const handleProfileMouseEnter = () => {
    if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
    }
    setIsHoveringProfile(true);
  };

  const handleProfileMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
        setIsHoveringProfile(false);
    }, 200); // Small delay to allow moving mouse into the popover
  };

  useEffect(() => {
    if (embedUrl) {
        setIsPlaying(isActive);
        return;
    };

    if (isActive) {
      videoRef.current?.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        setIsPlaying(false);
      });
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isActive, embedUrl]);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.volume = volume;
        videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);
  
  useEffect(() => {
    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = document.fullscreenElement === containerRef.current;
      setIsFullScreen(isCurrentlyFullScreen);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (qualityMenuRef.current && !qualityMenuRef.current.contains(event.target as Node)) {
            setIsQualityMenuOpen(false);
        }
    };
    if (isQualityMenuOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isQualityMenuOpen]);


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

  const togglePlayWithAnimation = () => {
    togglePlay();
    setShowPlayPause(true);
    setTimeout(() => setShowPlayPause(false), 800);
  };
  
  const handleLike = () => {
      setIsLiked(!isLiked);
  }
  
  const handleClickOnVideo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
        tapTimeout.current = null;
    }

    const currentTime = new Date().getTime();
    const timeDifference = currentTime - lastTap.current;

    if (timeDifference < 300 && timeDifference > 0) {
        if (!isLiked) {
            setIsLiked(true);
        }

        const rect = containerRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setLikeAnimation({ key: Date.now(), x, y });
        
        lastTap.current = 0;
    } else {
        lastTap.current = currentTime;
        tapTimeout.current = setTimeout(() => {
            togglePlayWithAnimation();
            tapTimeout.current = null;
        }, 300);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;

    const shareUrl = `https://vidora.app/video/${video.id}`;
    const shareData = {
      title: 'Check out this awesome video!',
      text: video.description,
      url: shareUrl,
    };

    setIsSharing(true);

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
      setIsShared(true);
      onShareVideo(video.id);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('Share was cancelled by the user.');
      } else {
          console.error('Error sharing:', error);
      }
    } finally {
        setIsSharing(false);
    }
  };

  const toggleFullScreen = () => {
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

  const toggleMute = () => {
    if (!embedUrl && isMuted && volume === 0) {
        setVolume(1);
    }
    setIsMuted(prev => !prev);

    if (!embedUrl) {
      setShowVolumeSlider(true);
      if (volumeSliderTimeout.current) clearTimeout(volumeSliderTimeout.current);
      volumeSliderTimeout.current = setTimeout(() => setShowVolumeSlider(false), 3000);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (volumeSliderTimeout.current) clearTimeout(volumeSliderTimeout.current);
    volumeSliderTimeout.current = setTimeout(() => setShowVolumeSlider(false), 3000);
  };

  const handleQualityChange = (quality: string) => {
    if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        const wasPlaying = !videoRef.current.paused;
        const newSource = video.videoSources.find(s => s.quality === quality)?.url;

        if (newSource) {
            videoRef.current.src = newSource;
            videoRef.current.load();
    
            const onLoaded = () => {
                if (videoRef.current) {
                    videoRef.current.currentTime = currentTime;
                    if (wasPlaying) {
                        videoRef.current.play();
                    }
                    videoRef.current.removeEventListener('loadedmetadata', onLoaded);
                }
            };
    
            videoRef.current.addEventListener('loadedmetadata', onLoaded);
        }
    }
    setCurrentQuality(quality);
    setIsQualityMenuOpen(false);
  };

  if (!videoUrl) {
    return (
        <div className="relative w-full h-full snap-start bg-black flex items-center justify-center text-center p-4" data-video-id={video.id}>
            <div className="bg-red-900/50 border border-red-500/50 p-4 rounded-lg">
                <p className="font-bold text-red-400">Video Error</p>
                <p className="text-sm text-red-300 mt-1">Video source is missing or invalid.</p>
            </div>
        </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full snap-start" data-video-id={video.id} onClick={handleClickOnVideo}>
      {embedUrl ? (
        <iframe
          src={isActive ? embedUrl : ''}
          title={video.description}
          className="w-full h-full object-cover pointer-events-none"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          loop
          playsInline
          className="w-full h-full object-cover pointer-events-none"
        />
      )}
      
      {bannerAd && <AdBannerOverlay ad={bannerAd} />}
      
      {likeAnimation && (
        <div
          key={likeAnimation.key}
          className="absolute animate-like-heart pointer-events-none"
          style={{
            top: likeAnimation.y,
            left: likeAnimation.x,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
          }}
        >
          <HeartIcon isFilled={true} className="w-24 h-24" />
        </div>
      )}
      
      {showPlayPause && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 p-4 rounded-full animate-fade-out">
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 text-white bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
        <div className="flex items-center">
            <div 
                className="relative pointer-events-auto"
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
            >
                <button onClick={(e) => { e.stopPropagation(); onViewProfile(video.user); }} className="flex items-center">
                    <img src={video.user.avatarUrl} alt={video.user.username} className="w-10 h-10 rounded-full border-2 border-white" />
                    <h3 className="font-bold ml-3">@{video.user.username}</h3>
                </button>
                {isHoveringProfile && (
                    <div 
                        className="absolute bottom-full left-0 mb-2 w-64 bg-zinc-800/90 backdrop-blur-sm rounded-lg shadow-lg p-3 z-10 animate-fade-in-up text-left pointer-events-auto"
                        onMouseEnter={handleProfileMouseEnter}
                        onMouseLeave={handleProfileMouseLeave}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <button onClick={(e) => { e.stopPropagation(); onViewProfile(video.user); }}>
                                <img src={video.user.avatarUrl} alt={video.user.username} className="w-12 h-12 rounded-full" />
                            </button>
                            {!isOwnProfile && (
                                <button
                                onClick={(e) => { e.stopPropagation(); onToggleFollow(video.user.id); }}
                                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
                                    isFollowing
                                        ? 'bg-zinc-700 text-white'
                                        : 'bg-white text-black'
                                }`}
                                >
                                {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            )}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onViewProfile(video.user); }}>
                            <h4 className="font-bold text-base hover:underline">@{video.user.username}</h4>
                        </button>
                        
                        <p className="text-sm text-gray-300 my-2 line-clamp-2">{video.user.bio || 'No bio yet.'}</p>

                        <div className="flex justify-start space-x-4 text-left mt-3 text-sm border-t border-zinc-700 pt-2">
                            <div>
                                <span className="font-bold">{formatNumber(video.user.following || 0)}</span>
                                <span className="text-gray-400 ml-1">Following</span>
                            </div>
                            <div>
                                <span className="font-bold">{formatNumber(video.user.followers || 0)}</span>
                                <span className="text-gray-400 ml-1">Followers</span>
                            </div>
                            <div>
                                <span className="font-bold">{formatNumber(video.user.totalLikes || 0)}</span>
                                <span className="text-gray-400 ml-1">Likes</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          {!isOwnProfile && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFollow(video.user.id); }}
              className={`ml-4 px-4 py-1.5 text-sm font-bold rounded-md transition-colors pointer-events-auto ${
                  isFollowing
                      ? 'bg-transparent border border-gray-400 text-gray-300'
                      : 'bg-white text-black'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
        <p className="mt-2 text-sm">{video.description}</p>
        <div className="flex items-center mt-2 text-sm">
          <MusicIcon />
          <p className="ml-2">Original Sound - {video.user.username}</p>
        </div>
      </div>
      
      <div className="absolute right-2 bottom-20 flex items-end space-x-2 text-white pointer-events-auto">
        {showVolumeSlider && !embedUrl && (
            <div className="bg-black/50 rounded-full h-24 w-8 flex items-center justify-center p-2 animate-fade-in-fast">
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
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
        
        {isQualityMenuOpen && (
            <div ref={qualityMenuRef} className="bg-black/70 backdrop-blur-sm rounded-lg p-2 animate-fade-in-fast" onClick={e => e.stopPropagation()}>
                <div className="text-xs text-gray-300 mb-1 px-2 font-semibold">Quality</div>
                {video.videoSources.map(source => (
                    <button 
                        key={source.quality}
                        onClick={() => handleQualityChange(source.quality)}
                        className={`w-full text-left text-sm px-2 py-1 rounded ${currentQuality === source.quality ? 'bg-pink-600' : 'hover:bg-zinc-700'}`}
                    >
                        {source.quality}
                    </button>
                ))}
            </div>
        )}


        <div className="flex flex-col items-center space-y-5">
            <button onClick={(e) => { e.stopPropagation(); handleLike(); }} className="flex flex-col items-center">
            <HeartIcon isFilled={isLiked} />
            <span className="text-xs font-semibold mt-1">{video.likes + (isLiked ? 1 : 0)}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onOpenComments(); }} className="flex flex-col items-center">
            <CommentIcon />
            <span className="text-xs font-semibold mt-1">{video.comments}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleShare(); }} disabled={isSharing} className="flex flex-col items-center disabled:opacity-50">
            <ShareIcon />
            <span className="text-xs font-semibold mt-1">{video.shares + (isShared ? 1 : 0)}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }} className="flex flex-col items-center">
            <FullScreenIcon isFullScreen={isFullScreen} />
            <span className="text-xs font-semibold mt-1">{isFullScreen ? 'Exit' : 'Full'}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="flex flex-col items-center">
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                <span className="text-xs font-semibold mt-1">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
             {!embedUrl && video.videoSources.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); setIsQualityMenuOpen(prev => !prev); }} className="flex flex-col items-center">
                    <SettingsIcon className="w-8 h-8" />
                    <span className="text-xs font-semibold mt-1">{currentQuality}</span>
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;