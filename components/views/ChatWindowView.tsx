import React, { useState, useEffect, useRef } from 'react';
import { Conversation, User } from '../../types';
import { ChevronLeftIcon, SendIcon, PaperclipIcon, EmojiIcon, CloseIcon } from '../icons/Icons';
import { mockUser } from '../../services/mockApi';
import EmojiPicker from '../EmojiPicker';

interface ChatWindowViewProps {
  conversation: Conversation;
  onBack: () => void;
  onSendMessage: (text: string, imageFile?: File) => void;
  onViewProfile: (user: User) => void;
}

const ChatWindowView: React.FC<ChatWindowViewProps> = ({ conversation, onBack, onSendMessage, onViewProfile }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [conversation.messages]);

  // Typing indicator simulation
  useEffect(() => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (lastMessage && lastMessage.senderId !== mockUser.id) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1500 + Math.random() * 1000); // Simulate typing for 1.5-2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [conversation.messages]);

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
        const maxHeight = 128; // max-h-32
        el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }
  }, [newMessage]);


  const handleSendMessage = () => {
    if (newMessage.trim() === '' && !imageFile) return;
    onSendMessage(newMessage.trim(), imageFile || undefined);
    setNewMessage('');
    setImageFile(null);
    if(imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setShowEmojiPicker(false);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      if(imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
      e.target.value = ''; // Allow selecting the same file again
    }
  };

  const removeImagePreview = () => {
    setImageFile(null);
    if(imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  return (
    <div className="h-full w-full bg-zinc-900 text-white flex flex-col pb-20">
      <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
        <button onClick={onBack} className="mr-4">
          <ChevronLeftIcon />
        </button>
        <button onClick={() => onViewProfile(conversation.user)} className="flex items-center flex-1">
          <img src={conversation.user.avatarUrl} alt={conversation.user.username} className="w-9 h-9 rounded-full mr-3" />
          <div className="text-left">
              <p className="font-bold text-sm">@{conversation.user.username}</p>
              <p className="text-xs text-green-400">Online</p>
          </div>
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((msg) => {
          const isCurrentUser = msg.senderId === mockUser.id;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              {!isCurrentUser && (
                <button onClick={() => onViewProfile(conversation.user)}>
                    <img src={conversation.user.avatarUrl} alt={conversation.user.username} className="w-7 h-7 rounded-full mb-1" />
                </button>
              )}
              <div className="flex flex-col max-w-xs md:max-w-md">
                <div className={`p-3 rounded-2xl ${isCurrentUser ? 'bg-pink-600/80 backdrop-blur-sm rounded-br-lg' : 'bg-zinc-700 rounded-bl-lg'}`}>
                  {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="sent image" className="rounded-lg mb-2 max-h-48" />
                  )}
                  {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                </div>
                <p className={`text-xs mt-1 ${isCurrentUser ? 'text-gray-400 text-right' : 'text-gray-400'}`}>{msg.timestamp}</p>
              </div>
            </div>
          );
        })}
        {isTyping && (
             <div className="flex items-end gap-2 justify-start">
                <img src={conversation.user.avatarUrl} alt={conversation.user.username} className="w-7 h-7 rounded-full mb-1" />
                <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-zinc-700 rounded-bl-lg">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-2 bg-zinc-900 border-t border-zinc-800">
        {imagePreview && (
          <div className="p-2 relative w-24">
            <img src={imagePreview} alt="Preview" className="rounded-md w-full" />
            <button onClick={removeImagePreview} className="absolute -top-1 -right-1 bg-black/70 rounded-full p-0.5 text-white hover:bg-black">
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white shrink-0">
            <PaperclipIcon />
          </button>
          <div className="relative flex-1" ref={emojiPickerRef}>
            {showEmojiPicker && <EmojiPicker className="absolute bottom-full mb-2 right-0" onSelectEmoji={(emoji) => setNewMessage(m => m + emoji)} />}
            <div className="relative">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  className="w-full bg-zinc-800 rounded-2xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder-gray-500 resize-none max-h-32 overflow-y-auto scrollbar-hide"
                />
                 <button onClick={() => setShowEmojiPicker(s => !s)} className="absolute right-2.5 bottom-2 p-1 text-gray-400 hover:text-white">
                    <EmojiIcon className="w-5 h-5"/>
                </button>
            </div>
          </div>
          <button onClick={handleSendMessage} className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center shrink-0 hover:bg-pink-700 transition-colors disabled:opacity-50" disabled={!newMessage.trim() && !imageFile}>
            <SendIcon />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatWindowView;