import React, { useState } from 'react';

const emojiCategories = {
    'Smileys': ['😀', '😂', '😍', '🤔', '😎', '😭', '🤯', '😡', '😴', '🥳', '🥺', '👍', '👎', '🙌', '🙏', '👋', '🤷', '🤦'],
    'Animals': ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🐵', '🐸', '🐢', '🌸', '🌹', '🌻', '🌍', '☀️', '🌙', '⭐'],
    'Food': ['🍎', '🍌', '🍇', '🍓', '🍔', '🍕', '🍟', '🍩', '☕', '🍺', '🍷', '🍹', '🍦', '🍰', '🍿', '🌮', '🍜', '🍣'],
    'Activities': ['⚽', '🏀', '🏈', '⚾', '🎾', '🎮', '🎸', '🎤', '🎁', '🎉', '💯'],
    'Travel': ['✈️', '🚗', '⛵', '🚀', '🛰️', '🗺️', '🗿', '🗼', '🗽', '🏠', '🏨', '🏪', '🏫', '🏦', '🏥', '🏭', '🏰', '💒'],
    'Objects': ['💡', '💻', '📱', '📷', '📺', '⌚', '⌨️', '🖱️', '💾', '💿', '📀', '📼', '📞', '📠', '📡', '🔋', '🔌', '💰'],
    'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    'Flags': ['🏳️‍🌈', '🏳️‍⚧️', '🇺🇸', '🇨🇦', '🇲🇽', '🇧🇷', '🇦🇷', '🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇷🇺', '🇨🇳', '🇯🇵', '🇰🇷', '🇮🇳', '🇦🇺'],
};

const categoryIcons: { [key: string]: string } = {
    'Smileys': '😀',
    'Animals': '🐶',
    'Food': '🍔',
    'Activities': '⚽',
    'Travel': '✈️',
    'Objects': '💡',
    'Symbols': '❤️',
    'Flags': '🏳️',
};

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  className?: string; // To handle positioning from parent
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, className }) => {
  const categoryKeys = Object.keys(emojiCategories) as (keyof typeof emojiCategories)[];
  const [activeCategory, setActiveCategory] = useState(categoryKeys[0]);

  return (
    <div className={`bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-20 animate-fade-in-up w-[min(90vw,17.5rem)] h-80 flex flex-col ${className}`}>
       <div className="p-2 border-b border-zinc-700 overflow-hidden">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          {categoryKeys.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`p-1.5 rounded-md text-lg shrink-0 ${activeCategory === category ? 'bg-zinc-600' : 'hover:bg-zinc-700'}`}
              title={category}
              aria-label={category}
            >
              {categoryIcons[category]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1">
          {emojiCategories[activeCategory].map(emoji => (
            <button
              key={emoji}
              onClick={() => onSelectEmoji(emoji)}
              className="text-2xl p-1 rounded-md hover:bg-zinc-700 transition-colors"
              aria-label={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;