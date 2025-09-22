

import React from 'react';
import { Notification } from '../../types';
import { mockNotifications } from '../../services/mockApi';
// Fix: Correct import for Icons which is now created.
import { ChevronLeftIcon } from '../icons/Icons';

interface NotificationsViewProps {
  onBack?: () => void;
}

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const renderText = () => {
    switch (notification.type) {
      case 'like':
        return <>liked your post.</>;
      case 'comment':
        return <>commented: "{notification.commentText}"</>;
      case 'follow':
        return <>started following you.</>;
      case 'mention':
        return <>mentioned you in a post.</>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-start p-4 border-b border-zinc-800 ${!notification.isRead ? 'bg-zinc-800/50' : ''}`}>
      <img src={notification.user.avatarUrl} alt={notification.user.username} className="w-10 h-10 rounded-full mr-3" />
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-bold">@{notification.user.username}</span>{' '}
          {renderText()}
        </p>
        <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
      </div>
      {notification.post && (
        <img src={notification.post.thumbnailUrl} alt="post" className="w-12 h-12 object-cover rounded-md ml-2" />
      )}
    </div>
  );
};

const NotificationsView: React.FC<NotificationsViewProps> = ({ onBack }) => {
  return (
    <div className="h-full w-full bg-zinc-900 text-white flex flex-col">
       <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
        {onBack && (
          <button onClick={onBack} className="mr-4">
            <ChevronLeftIcon />
          </button>
        )}
        <h1 className="text-lg font-bold">Notifications</h1>
      </header>
      <div className="flex-1 overflow-y-auto">
        {mockNotifications.map(notif => (
          <NotificationItem key={notif.id} notification={notif} />
        ))}
      </div>
    </div>
  );
};

export default NotificationsView;