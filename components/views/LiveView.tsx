import React, { useState, useEffect } from 'react';
// FIX: Added Ad type to support banner ads.
import { LiveStream, User, Ad } from '../../types';
import LiveDiscoveryView from './LiveDiscoveryView';
import BroadcasterView from './BroadcasterView';
import GoLiveModal from '../GoLiveModal';
import { View } from '../../App';

interface LiveViewProps {
  setIsNavVisible: (visible: boolean) => void;
  currentUser: User;
  onToggleFollow: (userId: string) => void;
  onShareStream: (streamId: string) => void;
  onViewProfile: (user: User) => void;
  showSuccessToast: (message: string) => void;
  openGoLiveModal: boolean;
  onModalOpened: () => void;
  bannerAds: Ad[];
  liveStreams: LiveStream[];
  onBanStreamer: (streamerId: string) => void;
  hasIncompleteDailyTasks: boolean;
  onNavigate: (view: View) => void;
}

export type BroadcastSource = 'camera' | 'video' | 'url';

const LiveView: React.FC<LiveViewProps> = ({ setIsNavVisible, currentUser, onToggleFollow, onShareStream, onViewProfile, showSuccessToast, openGoLiveModal, onModalOpened, bannerAds, liveStreams, onBanStreamer, hasIncompleteDailyTasks, onNavigate }) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [myStreamTitle, setMyStreamTitle] = useState('');
  const [myStreamSource, setMyStreamSource] = useState<BroadcastSource>('camera');
  const [myStreamSourceData, setMyStreamSourceData] = useState<File | string | undefined>(undefined);
  const [isGoLiveModalOpen, setIsGoLiveModalOpen] = useState(false);

  useEffect(() => {
    // When the user is broadcasting, hide the main navigation for a full-screen experience.
    // Show it again when they return to the discovery view.
    setIsNavVisible(!isBroadcasting);
  }, [isBroadcasting, setIsNavVisible]);

  useEffect(() => {
    if (openGoLiveModal) {
        setIsGoLiveModalOpen(true);
        onModalOpened();
    }
  }, [openGoLiveModal, onModalOpened]);

  const handleGoLiveClick = () => {
    setIsGoLiveModalOpen(true);
  };

  const handleStartStream = (title: string, source: BroadcastSource, data?: File | string) => {
    setMyStreamTitle(title);
    setMyStreamSource(source);
    setMyStreamSourceData(data);
    setIsBroadcasting(true);
    setIsGoLiveModalOpen(false);
  };

  const handleEndStream = () => {
    setIsBroadcasting(false);
    setMyStreamTitle('');
    setMyStreamSourceData(undefined);
  };

  if (isBroadcasting) {
    return <BroadcasterView 
              streamTitle={myStreamTitle} 
              sourceType={myStreamSource}
              sourceData={myStreamSourceData}
              onEndStream={handleEndStream} 
              onViewProfile={onViewProfile} 
              showSuccessToast={showSuccessToast}
            />;
  }

  return (
    <>
      <LiveDiscoveryView 
        liveStreams={liveStreams} 
        onGoLive={handleGoLiveClick}
        setIsNavVisible={setIsNavVisible} 
        currentUser={currentUser}
        onToggleFollow={onToggleFollow}
        onShareStream={onShareStream}
        onViewProfile={onViewProfile}
        bannerAds={bannerAds}
        onBanStreamer={onBanStreamer}
        hasIncompleteDailyTasks={hasIncompleteDailyTasks}
        onNavigate={onNavigate}
      />
      {isGoLiveModalOpen && (
        <GoLiveModal 
          onClose={() => setIsGoLiveModalOpen(false)} 
          onStartStream={handleStartStream} 
        />
      )}
    </>
  );
};

export default LiveView;