
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Video, User } from '../types';
import VideoPlayer from './VideoPlayer';
import { CloseIcon } from './icons/Icons';

interface ProfileVideoFeedModalProps {
  videos: Video[];
  startIndex: number;
  currentUser: User;
  onClose: () => void;
  onOpenComments: (video: Video) => void;
  onToggleFollow: (userId: string) => void;
  onShareVideo: (videoId: string) => void;
  onViewProfile: (user: User) => void;
}

const ProfileVideoFeedModal: React.FC<ProfileVideoFeedModalProps> = ({
  videos,
  startIndex,
  currentUser,
  onClose,
  onOpenComments,
  onToggleFollow,
  onShareVideo,
  onViewProfile,
}) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(videos[startIndex]?.id || null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to the initial video on mount
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const videoElement = container.children[startIndex] as HTMLElement;
      if (videoElement) {
        // Use 'instant' to avoid a scrolling animation that might not be perfectly centered.
        videoElement.scrollIntoView({ behavior: 'instant' });
      }
    }
  }, [startIndex]);

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const videoId = entry.target.getAttribute('data-video-id');
        setActiveVideoId(videoId);
      }
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.5, // 50% of the video must be visible
    });

    const videoElements = containerRef.current?.querySelectorAll('[data-video-id]');
    videoElements?.forEach(el => observer.observe(el));

    return () => {
      videoElements?.forEach(el => observer.unobserve(el));
    };
  }, [videos, observerCallback]);

  return (
    <div className="fixed inset-0 bg-black z-50 animate-fade-in-fast">
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-20 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
        aria-label="Close video feed"
      >
        <CloseIcon />
      </button>

      <div
        ref={containerRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-auto scrollbar-hide"
      >
        {videos.map(video => (
          <VideoPlayer
            key={video.id}
            video={video}
            isActive={video.id === activeVideoId}
            onOpenComments={() => onOpenComments(video)}
            currentUser={currentUser}
            onToggleFollow={onToggleFollow}
            onShareVideo={onShareVideo}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>
    </div>
  );
};

export default ProfileVideoFeedModal;
