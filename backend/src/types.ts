export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: 'user' | 'creator' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'banned' | 'deleted';
  isVerified: boolean;
  joinDate: string;
  lastLogin: string;
  bio?: string;
  followers?: number;
  following?: number;
  totalLikes?: number;
  followingIds?: string[];
  likedVideoIds?: string[];
  wallet?: Wallet;
  creatorStats?: {
    totalEarnings: number;
    receivedGiftsCount: number;
  };
  level?: number;
  xp?: number;
  streakCount?: number;
  badges?: Badge[];
  deletionDate?: string;
  commentPrivacySetting?: 'everyone' | 'following' | 'nobody';
  savedPaymentMethods?: SavedPaymentMethod[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
}

export interface VideoSource {
    quality: string;
    url: string;
}

export interface Video {
  id: string;
  videoSources: VideoSource[];
  videoUrl?: string; // For backward compatibility
  description: string;
  user: User;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  commentsData: Comment[];
  thumbnailUrl?: string;
  status: 'approved' | 'pending' | 'removed';
  uploadDate: string;
}

export interface LiveStream {
  id: string;
  title: string;
  user: User;
  thumbnailUrl: string;
  viewers: number;
  videoUrl?: string;
  status?: 'live' | 'ended_by_moderator';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  imageUrl?: string;
}

export interface Conversation {
  id: string;
  user: User;
  messages: ChatMessage[];
  lastMessage: {
    text: string;
    timestamp: string;
    isRead: boolean;
    senderId: string;
  };
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user: User;
  post?: {
    id: string;
    thumbnailUrl: string;
  };
  commentText?: string;
  timestamp: string;
  isRead: boolean;
}

export interface Gift {
  id: string;
  name: string;
  price: number;
  icon: string;
  category: 'Trending' | 'Classic' | 'Premium' | 'Fun';
}

export interface WalletTransaction {
    id: string;
    type: 'purchase' | 'gift_received' | 'gift_sent' | 'reward' | 'payout';
    amount: number;
    description: string;
    timestamp: string;
}
  
export interface Wallet {
    balance: number;
    transactions: WalletTransaction[];
}

export interface LeaderboardUser {
    rank: number;
    user: User;
    score: number;
}

export interface Report {
    id: string;
    contentType: 'video' | 'user' | 'comment';
    contentId: string;
    reportedBy: User;
    reason: string;
    timestamp: string;
    status: 'pending' | 'resolved' | 'dismissed';
}

export interface PayoutRequest {
  id: string;
  user: User;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  method: string;
  payoutInfo: string;
  requestDate: string;
  processedDate?: string;
}

export interface PaymentProvider {
    id: string;
    name: string;
    isEnabled: boolean;
}

export interface MonetizationSettings {
    currencySymbol: string;
    processingFeePercent: number;
    minPayoutAmount: number;
    paymentProviders: PaymentProvider[];
    creatorCriteria: {
        minFollowers: number;
        minViews: number;
        minVideos: number;
    };
}

export type UploadSource = { type: 'file', data: File } | { type: 'url', data: string };

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface GiftEvent {
    id: string;
    user: User;
    gift: Gift;
}

export interface CreatorApplication {
    id: string;
    user: User;
    status: 'pending' | 'approved' | 'rejected';
    applicationDate: string;
    message: string;
    statsSnapshot: {
        followers: number;
        views: number;
        videos: number;
    };
}

export interface CoinPack {
    amount: number;
    price: number;
    description: string;
    isPopular?: boolean;
}

export interface SavedPaymentMethod {
    id: string;
    type: string;
    details: string;
    isDefault: boolean;
}