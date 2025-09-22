import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Comment as CommentType, User, Video } from '../types';
import { CloseIcon, SendIcon, EmojiIcon } from './icons/Icons';
import EmojiPicker from './EmojiPicker';

interface CommentsModalProps {
  video: Video;
  currentUser: User;
  onClose: () => void;
  onAddComment: (commentText: string) => void;
  onViewProfile: (user: User) => void;
}

const Comment: React.FC<{ comment: CommentType; onViewProfile: (user: User) => void; }> = ({ comment, onViewProfile }) => (
  <div className="flex items-start gap-3 p-2">
    <button onClick={() => onViewProfile(comment.user)}>
        <img src={comment.user.avatarUrl} alt={comment.user.username} className="w-9 h-9 rounded-full" />
    </button>
    <div className="flex-1">
      <p className="text-xs text-gray-400">@{comment.user.username}</p>
      <p className="text-sm">{comment.text}</p>
      <p className="text-xs text-gray-500 mt-1">{comment.timestamp}</p>
    </div>
  </div>
);

const CommentsModal: React.FC<CommentsModalProps> = ({ video, currentUser, onClose, onAddComment, onViewProfile }) => {
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const comments = video.commentsData;
  const videoOwner = video.user;
  const isOwnVideo = videoOwner.id === currentUser.id;

  const canComment = useMemo(() => {
    if (isOwnVideo) return true;

    const setting = videoOwner.commentPrivacySetting || 'everyone';
    switch (setting) {
      case 'everyone':
        return true;
      case 'following':
        return videoOwner.followingIds?.includes(currentUser.id) ?? false;
      case 'nobody':
        return false;
      default:
        return true;
    }
  }, [videoOwner, currentUser, isOwnVideo]);

  useEffect(() => {
    // Scroll to bottom when modal opens or new comments are added
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [comments]);
  
  // Click away to close emoji picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      // Also close if the textarea is clicked
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
    if (textareaRef.current) {
        const el = textareaRef.current;
        el.style.height = 'auto';
        const maxHeight = 96; // max-h-24
        el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }
  }, [newComment]);


  const handleSendComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
      setShowEmojiPicker(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end z-40">
      <div className="bg-zinc-900 rounded-t-2xl shadow-xl w-full max-w-lg text-white relative animate-slide-in-up flex flex-col h-[60vh]">
        <header className="flex-shrink-0 flex justify-center items-center p-4 border-b border-zinc-800 relative">
          <h2 className="font-bold">{comments.length} Comments</h2>
          <button onClick={onClose} className="absolute right-4 text-gray-400 hover:text-white">
            <CloseIcon />
          </button>
        </header>

        <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.map(comment => (
            <Comment key={comment.id} comment={comment} onViewProfile={onViewProfile} />
          ))}
        </main>
        
        {canComment ? (
          <footer className="flex-shrink-0 p-4 bg-zinc-900 border-t border-zinc-800">
            <div className="flex items-end gap-2">
              <img src={currentUser.avatarUrl} alt="avatar" className="w-9 h-9 rounded-full" />
              <div className="relative flex-1" ref={emojiPickerRef}>
                  {showEmojiPicker && <EmojiPicker className="absolute bottom-full mb-2 right-0" onSelectEmoji={(emoji) => setNewComment(c => c + emoji)} />}
                  <div className="relative">
                      <textarea
                          ref={textareaRef}
                          rows={1}
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                          className="w-full bg-zinc-800 rounded-full border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm px-4 pr-12 py-2.5 resize-none max-h-24 overflow-y-auto scrollbar-hide"
                      />
                      <button onClick={() => setShowEmojiPicker(s => !s)} className="absolute right-3 bottom-2 p-1 text-gray-400 hover:text-white">
                          <EmojiIcon className="w-5 h-5" />
                      </button>
                  </div>
              </div>
              <button 
                  onClick={handleSendComment} 
                  className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50"
                  disabled={!newComment.trim()}
                  aria-label="Send comment"
              >
                  <SendIcon />
              </button>
            </div>
          </footer>
        ) : (
            <footer className="flex-shrink-0 p-4 bg-zinc-900 border-t border-zinc-800 text-center">
                <p className="text-sm text-gray-400">Comments are limited on this video.</p>
            </footer>
        )}
      </div>
    </div>
  );
};

export default CommentsModal;