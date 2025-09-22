import React, { useState, useRef, useEffect } from 'react';
import { Poll } from '../types';
import { PollIcon, ChevronUpIcon, ChevronDownIcon } from './icons/Icons';

interface LivePollDisplayProps {
  poll: Poll;
  onEndPoll: () => void;
}

const PollOptionBar: React.FC<{ text: string; votes: number; totalVotes: number }> = ({ text, votes, totalVotes }) => {
  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="font-semibold truncate pr-2">{text}</span>
        <span className="text-gray-300">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-zinc-600 rounded-full h-2.5">
        <div 
          className="bg-pink-500 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const LivePollDisplay: React.FC<LivePollDisplayProps> = ({ poll, onEndPoll }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  
  // State for dragging
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  // Initial position is top-right, accounting for component width (w-72 is 288px) and padding.
  const [position, setPosition] = useState({ x: window.innerWidth - 304, y: 112 }); 
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!nodeRef.current) return;
    setIsDragging(true);
    const rect = nodeRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPosition({
      x: clientX - dragOffset.current.x,
      y: clientY - dragOffset.current.y,
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  // Mouse Events
  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY);
  const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);

  // Touch Events
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => e.stopPropagation();

  return (
    <div
      ref={nodeRef}
      className="absolute bg-black/50 backdrop-blur-md border border-zinc-700 rounded-lg shadow-lg animate-fade-in-up w-72 pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      <div
        className="flex items-center justify-between text-gray-300 text-sm cursor-move p-4"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div className="flex items-center gap-2">
            <PollIcon className="w-5 h-5" />
            <h3 className="font-bold">Live Poll</h3>
        </div>
        <button 
          onClick={() => setIsMinimized(!isMinimized)} 
          onMouseDown={stopPropagation}
          onTouchStart={stopPropagation}
          className="p-1 hover:bg-zinc-700 rounded-full"
        >
            {isMinimized ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </div>

      {!isMinimized && (
          <div className="px-4 pb-4 space-y-3 animate-fade-in-up">
              <p className="font-semibold">{poll.question}</p>

              <div className="space-y-3">
                {poll.options.map(option => (
                  <PollOptionBar 
                    key={option.id}
                    text={option.text}
                    votes={option.votes}
                    totalVotes={poll.totalVotes}
                  />
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-zinc-700/50">
                <span className="text-xs text-gray-400">{poll.totalVotes} votes</span>
                <button 
                    onClick={onEndPoll}
                    onMouseDown={stopPropagation}
                    onTouchStart={stopPropagation}
                    className="px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    End Poll
                </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default LivePollDisplay;