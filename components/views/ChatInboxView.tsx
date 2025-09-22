import React from 'react';
import { Conversation, User } from '../../types';
// Fix: Correct import for Icons which is now created.
import { ChevronLeftIcon } from '../icons/Icons';

interface ChatInboxViewProps {
  conversations: Conversation[];
  onSelectChat: (conversationId: string) => void;
  onBack?: () => void; // Optional back navigation for integration
  onViewProfile: (user: User) => void;
}

const ChatInboxView: React.FC<ChatInboxViewProps> = ({ conversations, onSelectChat, onBack, onViewProfile }) => {
  return (
    <div className="h-full w-full bg-zinc-900 text-white flex flex-col pb-20">
      <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
        {onBack && (
          <button onClick={onBack} className="mr-4">
            <ChevronLeftIcon />
          </button>
        )}
        <h1 className="text-lg font-bold">Inbox</h1>
      </header>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(convo => (
          <div 
            key={convo.id} 
            className="flex items-center p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800"
            onClick={() => onSelectChat(convo.id)}
          >
            <button onClick={(e) => { e.stopPropagation(); onViewProfile(convo.user); }} className="relative z-10">
              <img src={convo.user.avatarUrl} alt={convo.user.username} className="w-12 h-12 rounded-full mr-4" />
            </button>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <p className="font-bold truncate">@{convo.user.username}</p>
                <p className="text-xs text-gray-400">{convo.lastMessage.timestamp}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-300 truncate">{convo.lastMessage.text}</p>
                {!convo.lastMessage.isRead && convo.lastMessage.senderId !== 'u1' && (
                    <span className="w-2.5 h-2.5 bg-pink-500 rounded-full flex-shrink-0 ml-2"></span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatInboxView;