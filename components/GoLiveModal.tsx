import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon } from './icons/Icons';
import { BroadcastSource } from './views/LiveView';
import { getYouTubeEmbedUrl } from '../utils/videoUtils';

interface GoLiveModalProps {
  onClose: () => void;
  onStartStream: (title: string, source: BroadcastSource, data?: File | string) => void;
}

const GoLiveModal: React.FC<GoLiveModalProps> = ({ onClose, onStartStream }) => {
  const [title, setTitle] = useState('');
  const [source, setSource] = useState<BroadcastSource>('camera');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setVideoFile(null);
      setPreviewUrl(null);
      if (file) alert("Please select a valid video file.");
    }
  };

  const isValidUrl = (url: string) => {
    if (getYouTubeEmbedUrl(url)) {
        return true;
    }
    const lowerUrl = url.toLowerCase();
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    if (videoExtensions.some(ext => lowerUrl.endsWith(ext))) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    return false;
  };

  const handleStart = () => {
    if (!title.trim()) return;

    if (source === 'video') {
        if (!videoFile) {
            alert('Please select a video file to broadcast.');
            return;
        }
        onStartStream(title, 'video', videoFile);
    } else if (source === 'url') {
        if (!isValidUrl(videoUrl)) {
            alert('Please enter a valid YouTube or direct video URL.');
            return;
        }
        onStartStream(title, 'url', videoUrl);
    } else {
        onStartStream(title, 'camera');
    }
  };

  const isStartDisabled = !title.trim() || 
                        (source === 'video' && !videoFile) ||
                        (source === 'url' && !isValidUrl(videoUrl));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-sm text-white relative animate-fade-in-up flex flex-col max-h-[90vh]">
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-zinc-700">
            <h2 className="text-xl font-bold">Go Live</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <CloseIcon />
            </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Broadcast Source</label>
            <div className="grid grid-cols-3 bg-zinc-700 rounded-lg p-1">
              <button
                onClick={() => setSource('camera')}
                className={`py-2 text-xs font-semibold rounded-md transition-colors ${source === 'camera' ? 'bg-pink-600' : ''}`}
              >
                Camera
              </button>
              <button
                onClick={() => setSource('video')}
                className={`py-2 text-xs font-semibold rounded-md transition-colors ${source === 'video' ? 'bg-pink-600' : ''}`}
              >
                Video File
              </button>
              <button
                onClick={() => setSource('url')}
                className={`py-2 text-xs font-semibold rounded-md transition-colors ${source === 'url' ? 'bg-pink-600' : ''}`}
              >
                From URL
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">Stream Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q&A Session"
              className="w-full p-2 bg-zinc-700 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {source === 'video' && (
            <div className="animate-fade-in-up">
              <label className="block text-sm font-medium text-gray-400 mb-1">Upload Video</label>
              {previewUrl ? (
                <div className="w-full aspect-[9/16] rounded-lg overflow-hidden bg-black mb-2 relative">
                  <video src={previewUrl} controls loop className="w-full h-full object-cover" />
                  <button onClick={() => { setVideoFile(null); setPreviewUrl(null); }} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-black">
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="w-full aspect-[9/16] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors border-zinc-600 hover:border-pink-500"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="w-12 h-12 text-zinc-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <p className="font-semibold">Tap to Select Video</p>
                  <p className="text-xs text-gray-400 mt-1">Select a video file to broadcast.</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
            </div>
          )}
          
          {source === 'url' && (
             <div className="animate-fade-in-up">
              <label htmlFor="video-url" className="block text-sm font-medium text-gray-400 mb-1">Video URL</label>
              <input
                id="video-url"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter YouTube or direct video URL (.mp4)"
                className="w-full p-2 bg-zinc-700 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          )}
        </main>
        
        <footer className="flex-shrink-0 p-4 border-t border-zinc-700">
            <button 
              onClick={handleStart}
              disabled={isStartDisabled}
              className="w-full py-3 font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Live Stream
            </button>
        </footer>
      </div>
    </div>
  );
};

export default GoLiveModal;