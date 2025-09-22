

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Video, User, Ad, AdSettings } from '../../types';
import VideoPlayer from '../VideoPlayer';
import AdPlayer from '../AdPlayer';

interface FeedViewProps {
  videos: Video[];
  currentUser: User;
  onOpenComments: (video: Video) => void;
  setIsNavVisible: (visible: boolean) => void;
  onToggleFollow: (userId: string) => void;
  onShareVideo: (videoId: string) => void;
  onViewProfile: (user: User) => void;
  adSettings: AdSettings;
  interstitialAds: Ad[];
  bannerAds: Ad[];
}

const FeedView: React.FC<FeedViewProps> = ({
  videos,
  currentUser,
  onOpenComments,
  setIsNavVisible,
  onToggleFollow,
  onShareVideo,
  onViewProfile,
  adSettings,
  interstitialAds,
  bannerAds
}) => {
  
  const feedItems = useMemo(() => {
    if (!adSettings.isEnabled || interstitialAds.length === 0 || adSettings.interstitialFrequency <= 0) {
      return videos;
    }
    const newFeed: (Video | Ad)[] = [];
    let adCounter = 0;
    for (let i = 0; i < videos.length; i++) {
      newFeed.push(videos[i]);
      if ((i + 1) % adSettings.interstitialFrequency === 0) {
        newFeed.push(interstitialAds[adCounter % interstitialAds.length]);
        adCounter++;
      }
    }
    return newFeed;
  }, [videos, interstitialAds, adSettings]);

  const [activeItemId, setActiveItemId] = useState<string | null>(feedItems.length > 0 ? feedItems[0].id : null);
  const [fullScreenVideoId, setFullScreenVideoId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const handleSkipAd = useCallback(() => {
    if (!containerRef.current || !activeItemId) return;
    
    const currentIndex = feedItems.findIndex(item => item.id === activeItemId);
    
    if (currentIndex !== -1 && currentIndex < feedItems.length - 1) {
      const nextItemElement = containerRef.current.children[currentIndex + 1] as HTMLElement;
      if (nextItemElement) {
        nextItemElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeItemId, feedItems]);
  
  useEffect(() => {
    const handleFullScreenChange = () => {
        const fullScreenElement = document.fullscreenElement;
        if (fullScreenElement && fullScreenElement.hasAttribute('data-video-id')) {
            setFullScreenVideoId(fullScreenElement.getAttribute('data-video-id'));
        } else {
            setFullScreenVideoId(null);
        }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const itemId = entry.target.getAttribute('data-video-id');
        setActiveItemId(itemId);
      }
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const currentScrollY = containerRef.current.scrollTop;

    if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
      setIsNavVisible(false);
    } 
    else if (currentScrollY < lastScrollY.current) {
      setIsNavVisible(true);
    }
    
    lastScrollY.current = currentScrollY;
  }, [setIsNavVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.5,
    });

    const feedElements = containerRef.current?.querySelectorAll('[data-video-id]');
    feedElements?.forEach(el => observer.observe(el));
    
    const scrollContainer = containerRef.current;
    scrollContainer?.addEventListener('scroll', handleScroll);

    return () => {
      feedElements?.forEach(el => observer.unobserve(el));
      scrollContainer?.removeEventListener('scroll', handleScroll);
    };
  }, [feedItems, observerCallback, handleScroll]);
  
  const getBannerAdForVideo = (video: Video) => {
      if (!adSettings.isEnabled || bannerAds.length === 0) return undefined;
      const videoIndex = videos.findIndex(v => v.id === video.id);
      if (videoIndex === -1) return undefined;
      return bannerAds[videoIndex % bannerAds.length];
  }

  return (
    <div className="h-full w-full relative bg-black">
      <div 
        ref={containerRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-auto scrollbar-hide"
      >
        {feedItems.map(item => {
          const isActive = fullScreenVideoId ? item.id === fullScreenVideoId : item.id === activeItemId;
          if ('videoSources' in item) { // It's a Video
            return (
              <VideoPlayer
                key={item.id}
                video={item}
                isActive={isActive}
                onOpenComments={() => onOpenComments(item)}
                currentUser={currentUser}
                onToggleFollow={onToggleFollow}
                onShareVideo={onShareVideo}
                onViewProfile={onViewProfile}
                bannerAd={getBannerAdForVideo(item)}
              />
            );
          } else { // It's an Ad
            return <AdPlayer 
                    key={item.id} 
                    ad={item} 
                    isActive={isActive} 
                    adSettings={adSettings}
                    onSkip={handleSkipAd}
                   />;
          }
        })}
      </div>
    </div>
  );
};

export default FeedView;