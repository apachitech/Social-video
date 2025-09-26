import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LiveStream, ChatMessage, User, Gift, Ad } from '../../types';
import { CloseIcon, HeartIcon, SendIcon, EmojiIcon, GiftIcon, ShareIcon, CoinIcon, ChevronLeftIcon, PinIcon, PaperclipIcon, VolumeUpIcon, VolumeOffIcon, ShieldCheckIcon, BanUserIcon, TasksIcon, ChevronRightIcon } from '../icons/Icons';
import { mockUser, mockGifts, mockUsers } from '../../services/mockApi';
import SendGiftModal from '../SendGiftModal';
import EmojiPicker from '../EmojiPicker';
import { getYouTubeEmbedUrl } from '../../utils/videoUtils';
import AdBannerOverlay from '../AdBannerOverlay';
import ModerationActionConfirmationModal from '../ModerationActionConfirmationModal';
import { View } from '../../App';

interface ViewerLiveViewProps {
  stream: LiveStream;
  onBack: () => void;
  currentUser: User;
  onToggleFollow: (userId: string) => void;
  onShareStream: (streamId: string) => void;
  onViewProfile: (user: User) => void;
  bannerAds: Ad[];
  onBanStreamer: (streamerId: string) => void;
  hasIncompleteDailyTasks: boolean;
  onNavigate: (view: View) => void;
}

type TopGifter = {
    user: User;
    amount: number;
}

const FloatingHeart: React.FC<{ onAnimationEnd: () => void }> = ({ onAnimationEnd }) => {
    useEffect(() => {
        const timer = setTimeout(onAnimationEnd, 3000);
        return () => clearTimeout(timer);
    }, [onAnimationEnd]);

    const style = {
        left: `${Math.random() * 100}%`,
        animationDuration: `${2 + Math.random() * 2}s`,
    };

    return (
        <div className="absolute bottom-0 animate-float-up" style={style}>
            <HeartIcon isFilled={true} className="w-7 h-7" />
        </div>
    );
};

const ViewerLiveView: React.FC<ViewerLiveViewProps> = ({ stream, onBack, currentUser, onToggleFollow, onShareStream, onViewProfile, bannerAds, onBanStreamer, hasIncompleteDailyTasks, onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', senderId: stream.user.id, text: `Welcome to the stream!`, isRead: true, timestamp: '' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number }[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [localBalance, setLocalBalance] = useState(currentUser.wallet?.balance ?? 0);
  const [topGifters, setTopGifters] = useState<TopGifter[]>([]);
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const swipeDirection = useRef<'horizontal' | 'vertical' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const heartCounter = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const volumeSliderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [activeBannerAd, setActiveBannerAd] = useState<Ad | null>(null);
  const [isModModalOpen, setIsModModalOpen] = useState(false);

  const isFollowing = currentUser.followingIds?.includes(stream.user.id);
  const isOwnStream = currentUser.id === stream.user.id;
  const isModerator = currentUser.role === 'moderator' || currentUser.role === 'admin';
  const wasBanned = stream.status === 'ended_by_moderator';
  
  const embedUrl = useMemo(() => stream.videoUrl ? getYouTubeEmbedUrl(stream.videoUrl, isMuted) : null, [stream.videoUrl, isMuted]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
       const target = event.target as Node;
      const isTextarea = target === textareaRef.current;
      if (emojiPickerRef.current && (!emojiPickerRef.current.contains(target) || isTextarea)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const otherUsers = mockUsers.filter(u => u.id !== mockUser.id && u.id !== stream.user.id);
    const sampleMessages = [ 'This is awesome! 🔥', 'Wow, great stream!', 'Hello from Brazil! 🇧🇷', 'LOL 😂' ];

    const intervalId = setInterval(() => {
      const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      const eventType = Math.random();

      if (eventType < 0.8) {
        const randomMessageText = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random()}`, senderId: randomUser.id, text: randomMessageText, timestamp: '', isRead: true,
        };
        setMessages(prev => [...prev.slice(-20), newMessage]);
      } else {
        const randomGift = mockGifts[Math.floor(Math.random() * 5)];
        handleGiftFromOtherUser(randomUser, randomGift);
      }
    }, 3500);
    
    const pinTimeout = setTimeout(() => {
        if (document.visibilityState === 'visible') {
            setPinnedMessage("Don't forget to follow and share the stream! ❤️");
        }
    }, 12000);

    return () => {
        clearInterval(intervalId);
        clearTimeout(pinTimeout);
    };
  }, [stream.user.id]);

  useEffect(() => {
    if (textareaRef.current) {
        const el = textareaRef.current;
        el.style.height = 'auto';
        const maxHeight = 96;
        el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }
  }, [newMessage]);
  
  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.volume = volume;
        videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (bannerAds.length > 0) {
        const showAd = () => {
            const adToShow = bannerAds[Math.floor(Math.random() * bannerAds.length)];
            setActiveBannerAd(adToShow);
            setTimeout(() => setActiveBannerAd(null), 15000);
        };

        const adInterval = setInterval(showAd, 60000);
        const initialAdTimeout = setTimeout(showAd, 10000);

        return () => {
            clearInterval(adInterval);
            clearTimeout(initialAdTimeout);
        };
    }
  }, [bannerAds]);

  const toggleMute = () => {
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

  const handleGiftFromOtherUser = (user: User, gift: Gift) => {
    const giftMessage: ChatMessage = {
        id: `gift-${Date.now()}-${user.id}`, senderId: user.id, text: `sent a ${gift.name}! ${gift.icon}`, timestamp: '', isRead: true,
    };

    setMessages(prev => [...prev.slice(-20), giftMessage]);
    updateTopGifters(user, gift.price);
  };
  
  const updateTopGifters = (user: User, amount: number) => {
    setTopGifters(prev => {
        const userIndex = prev.findIndex(g => g.user.id === user.id);
        let newGifters = [...prev];
        if (userIndex > -1) {
            newGifters[userIndex].amount += amount;
        } else {
            newGifters.push({ user, amount });
        }
        return newGifters.sort((a, b) => b.amount - a.amount).slice(0, 3);
    });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' && !imageFile) return;

    let imageUrl: string | undefined = undefined;
    if (imageFile) {
        imageUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imageFile);
        });
    }

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: mockUser.id,
      text: newMessage,
      timestamp: '',
      isRead: true,
      imageUrl,
    };
    setMessages(prevMessages => [...prevMessages, message]);
    setNewMessage('');
    
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImageFile(file);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(URL.createObjectURL(file));
        e.target.value = '';
    }
  };

  const removeImagePreview = () => {
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
  };

  const handleSendGift = (gift: Gift) => {
    if (localBalance < gift.price) {
        alert("You don't have enough coins!");
        return;
    }
    
    setLocalBalance(prev => prev - gift.price);
    handleGiftFromOtherUser(currentUser, gift);
    setIsGiftModalOpen(false);
  };
  
  const handleSendLike = () => {
    const newHeart = { id: heartCounter.current++ };
    setFloatingHearts(prev => [...prev, newHeart]);
  };

  const removeHeart = (idToRemove: number) => {
    setFloatingHearts(prev => prev.filter(heart => heart.id !== idToRemove));
  };
  
  const handleShare = async () => {
    if (isSharing) return;
    const shareUrl = `https://vidora.app/stream/${stream.id}`;
    const shareData = { title: `Watch ${stream.user.username}'s live stream!`, text: stream.title, url: shareUrl };
    setIsSharing(true);
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(shareUrl);
      onShareStream(stream.id);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') console.log('Share cancelled.');
      else console.error('Error sharing:', error);
    } finally {
        setIsSharing(false);
    }
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    touchStartX.current = clientX;
    touchStartY.current = clientY;
    touchEndX.current = clientX;
    swipeDirection.current = null;
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    touchEndX.current = clientX;
    if (swipeDirection.current === null) {
      const deltaX = Math.abs(clientX - touchStartX.current);
      const deltaY = Math.abs(clientY - touchStartY.current);
      if (deltaX > 10 || deltaY > 10) {
        swipeDirection.current = deltaX > deltaY ? 'horizontal' : 'vertical';
      }
    }
  };

  const handleDragEnd = () => {
    if (swipeDirection.current !== 'horizontal') return;
    const swipeDistance = touchEndX.current - touchStartX.current;
    const swipeThreshold = 50;
    if (swipeDistance > swipeThreshold) setIsUiVisible(false);
    else if (swipeDistance < -swipeThreshold) setIsUiVisible(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.closest('button')) {
        return;
    }
    handleDragStart(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.closest('button')) {
        return;
    }
    e.preventDefault();
    setIsDragging(true);
    handleDragStart(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleDragMove(e.clientX, e.clientY);
  };
  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    handleDragEnd();
  };
  const handleMouseLeave = () => {
    if (isDragging) handleMouseUp();
  };
  
  const handleBanClick = () => {
    setIsModModalOpen(true);
  };

  const handleConfirmBan = () => {
    onBanStreamer(stream.user.id);
    setIsModModalOpen(false);
  };


  const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const user = mockUsers.find(u => u.id === message.senderId) || stream.user;
    const isBroadcaster = message.senderId === stream.user.id;
    const isCurrentUser = message.senderId === currentUser.id;

    let badge = null;
    if (isBroadcaster) {
        badge = <span className="text-xs font-bold text-pink-400 ml-1.5">[Host]</span>;
    } else if (isCurrentUser) {
        badge = <span className="text-xs font-bold text-cyan-400 ml-1.5">[You]</span>;
    }

    return (
        <div className={`flex items-start gap-2.5 p-1 w-full ${isBroadcaster ? 'flex-row-reverse' : ''}`}>
            <button onClick={() => onViewProfile(user)} className="shrink-0">
                <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full" />
            </button>
            <div className={`flex flex-col max-w-[80%] ${isBroadcaster ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center mb-0.5">
                    <span className="text-xs text-gray-400 px-1">@{user.username}</span>
                    {badge}
                </div>
                <div className={`text-sm px-3.5 py-2.5 rounded-2xl break-words ${isBroadcaster ? 'bg-pink-600 text-white rounded-br-md' : 'bg-zinc-700 text-white rounded-bl-md'}`}>
                    {message.imageUrl && <img src={message.imageUrl} alt="sent content" className="rounded-lg mb-1.5 max-h-40" />}
                    {message.text && <span>{message.text}</span>}
                </div>
            </div>
        </div>
    );
  };

  const TopGifterPodium: React.FC<{ gifters: TopGifter[] }> = ({ gifters }) => {
    const podiumOrder = [1, 0, 2];
    const sortedGifters = [...gifters];
    return (
        <div className="flex justify-center items-end gap-2 p-2 bg-black/30 rounded-lg animate-fade-in-up pointer-events-auto">
            {podiumOrder.map(index => {
                const gifter = sortedGifters[index];
                const rank = [2, 1, 3][index];
                if (!gifter) return <div key={rank} className="w-12"></div>;
                const size = rank === 1 ? 'w-12 h-12' : 'w-10 h-10';
                const medal = ['🥇', '🥈', '🥉'][rank - 1];
                return (
                    <button key={gifter.user.id} onClick={() => onViewProfile(gifter.user)} className="flex flex-col items-center pointer-events-auto">
                        <div className="relative">
                           <img src={gifter.user.avatarUrl} alt={gifter.user.username} className={`${size} rounded-full border-2 ${rank === 1 ? 'border-yellow-400' : 'border-zinc-500'}`} />
                           <span className="absolute -bottom-2 -right-2 text-lg">{medal}</span>
                        </div>
                        <p className="text-xs font-bold mt-1.5 truncate max-w-[60px]">@{gifter.user.username}</p>
                        <div className="flex items-center text-xs text-yellow-400">
                          <CoinIcon className="w-3 h-3 mr-0.5"/>
                          {gifter.amount}
                        </div>
                    </button>
                );
            })}
        </div>
    );
  };

  if (wasBanned) {
    return (
        <div className="absolute inset-0 w-full h-full bg-black text-white flex flex-col items-center justify-center gap-4 p-4 animate-fade-in-fast">
            <div className="text-red-500"><BanUserIcon className="w-16 h-16"/></div>
            <h2 className="text-xl font-bold">Stream Ended by Moderator</h2>
            <p className="text-gray-400 text-center">This stream was terminated for violating community guidelines.</p>
            <button onClick={onBack} className="mt-4 px-6 py-2 bg-pink-600 rounded-lg font-semibold">
                Back to Discovery
            </button>
        </div>
    );
  }

  return (
    <>
      <div 
        className="absolute inset-0 w-full h-full bg-black text-white overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {stream.videoUrl ? (
            embedUrl ? (
                <iframe
                    key={embedUrl}
                    src={embedUrl}
                    title={stream.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <video
                    ref={videoRef}
                    src={stream.videoUrl}
                    autoPlay
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )
        ) : (
            <img src={stream.thumbnailUrl} alt={stream.title} className="absolute inset-0 w-full h-full object-cover"/>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

        {activeBannerAd && <AdBannerOverlay ad={activeBannerAd} />}

        <div className="absolute bottom-24 right-4 h-96 w-20 pointer-events-none z-20">
          {floatingHearts.map(heart => (
            <FloatingHeart key={heart.id} onAnimationEnd={() => removeHeart(heart.id)} />
          ))}
        </div>
        
        <div className={`absolute inset-0 flex flex-col transition-all duration-300 ease-in-out ${isUiVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
          <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
            <button onClick={() => onViewProfile(stream.user)} className="flex items-center bg-black/40 p-2 rounded-lg">
              <img src={stream.user.avatarUrl} alt={stream.user.username} className="w-8 h-8 rounded-full mr-3" />
              <div>
                  <p className="font-bold text-sm">@{stream.user.username}</p>
                  <p className="text-xs">{stream.title}</p>
              </div>
              {!isOwnStream && !isFollowing && (
                  <div
                    onClick={(e) => { e.stopPropagation(); onToggleFollow(stream.user.id); }}
                    className="ml-3 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-lg font-bold shrink-0 hover:bg-pink-600 transition-colors"
                    aria-label={`Follow ${stream.user.username}`}
                  >
                    +
                  </div>
              )}
            </button>
            <div className="flex items-center gap-2">
              {isModerator && !isOwnStream && (
                <button onClick={handleBanClick} className="p-2 bg-black/40 rounded-full hover:bg-red-600/50 transition-colors" title="Moderate Stream">
                    <ShieldCheckIcon className="w-5 h-5 text-red-400"/>
                </button>
              )}
              <div className="bg-black/40 p-2 rounded-lg text-xs">{stream.viewers.toLocaleString()} watching</div>
              <button onClick={onBack} className="p-2 bg-black/40 rounded-full">
                <CloseIcon />
              </button>
            </div>
          </header>
          
          {hasIncompleteDailyTasks && (
            <div className="px-4 pt-20 pointer-events-auto">
                <button 
                    onClick={(e) => { e.stopPropagation(); onNavigate('tasks'); }}
                    className="w-full bg-purple-600/70 backdrop-blur-sm p-2 rounded-lg flex justify-between items-center hover:bg-purple-500/70 transition-colors animate-fade-in-up text-xs"
                >
                    <div className="flex items-center gap-2">
                        <TasksIcon className="w-5 h-5" />
                        <p className="font-semibold text-left">Tap to complete daily tasks & earn rewards!</p>
                    </div>
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>
        )}

          <div className="flex-1"></div>
          
          <footer className="p-4 flex flex-col-reverse gap-2">
            <div>
              {imagePreview && (
                  <div className="self-start p-2 relative w-24 bg-black/40 rounded-lg pointer-events-auto mb-2">
                      <img src={imagePreview} alt="Preview" className="rounded-md w-full" />
                      <button onClick={removeImagePreview} className="absolute -top-1 -right-1 bg-black/70 rounded-full p-0.5 text-white hover:bg-black">
                          <CloseIcon className="w-4 h-4" />
                      </button>
                  </div>
              )}
              <div className="h-48 overflow-y-auto space-y-1 pr-2 scrollbar-hide" style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
                  {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
                  <div ref={messagesEndRef} />
              </div>
              <div className="flex items-end space-x-2 mt-2">
                <div ref={emojiPickerRef} className="flex-1 flex items-end bg-black/40 rounded-full px-2 py-1.5 min-h-[44px] relative">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-300 hover:text-white shrink-0" aria-label="Attach an image">
                        <PaperclipIcon className="w-5 h-5"/>
                    </button>
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        placeholder="Add a comment..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        className="flex-1 w-full bg-transparent text-sm focus:outline-none placeholder-gray-400 resize-none py-1 px-2 max-h-24 overflow-y-auto scrollbar-hide align-bottom"
                    />
                    <div className="relative">
                        <button onClick={() => setShowEmojiPicker(s => !s)} className="p-2 text-gray-300 hover:text-white shrink-0">
                            <EmojiIcon className="w-5 h-5"/>
                        </button>
                        {showEmojiPicker && <EmojiPicker className="absolute bottom-full mb-2 right-0" onSelectEmoji={(emoji) => setNewMessage(m => m + emoji)} />}
                    </div>
                    {(newMessage.trim() || imageFile) && (
                        <button 
                            onClick={handleSendMessage} 
                            className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center shrink-0 ml-1 animate-fade-in-up"
                            aria-label="Send message"
                        >
                            <SendIcon />
                        </button>
                    )}
                </div>

                {showVolumeSlider && !embedUrl && (
                    <div className="bg-black/40 rounded-full h-24 w-8 flex items-center justify-center p-2 animate-fade-in-fast pointer-events-auto">
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
                
                <div className="flex flex-col space-y-2">
                    <button 
                        onClick={toggleMute}
                        className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center shrink-0"
                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                    >
                        {isMuted || (!embedUrl && volume === 0) ? <VolumeOffIcon className="w-6 h-6" /> : <VolumeUpIcon className="w-6 h-6" />}
                    </button>
                    <button 
                        onClick={handleShare}
                        disabled={isSharing}
                        className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50"
                        aria-label="Share stream"
                    >
                        <ShareIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={() => setIsGiftModalOpen(true)} 
                        className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-xl shrink-0"
                        aria-label="Send a gift"
                    >
                        <GiftIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={handleSendLike}
                        className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center shrink-0"
                        aria-label="Send a like"
                    >
                        <HeartIcon isFilled={true} className="w-6 h-6"/>
                    </button>
                </div>
              </div>
            </div>
            {pinnedMessage && (
                <div className="bg-pink-600/50 backdrop-blur-sm p-2.5 rounded-lg text-sm flex items-center gap-2 animate-fade-in-up pointer-events-auto">
                    <PinIcon className="w-4 h-4 text-pink-200 shrink-0"/>
                    <p className="font-semibold break-words">{pinnedMessage}</p>
                </div>
            )}
            {topGifters.length > 0 && (
                <TopGifterPodium gifters={topGifters} />
            )}
          </footer>
        </div>

        {!isUiVisible && (
            <button
                onClick={() => setIsUiVisible(true)}
                className="absolute inset-y-0 right-0 flex items-center pr-2 animate-pulse z-20"
                aria-label="Show stream controls"
            >
                <div className="bg-black/40 p-2 rounded-full">
                    <ChevronLeftIcon className="w-6 h-6 text-white/70" />
                </div>
            </button>
        )}

        {isGiftModalOpen && (
            <SendGiftModal 
                gifts={mockGifts}
                balance={localBalance}
                onSend={handleSendGift}
                onClose={() => setIsGiftModalOpen(false)}
            />
        )}
      </div>

      {isModModalOpen && (
        <ModerationActionConfirmationModal
            username={stream.user.username}
            onClose={() => setIsModModalOpen(false)}
            onConfirm={handleConfirmBan}
        />
      )}
    </>
  );
};

export default ViewerLiveView;