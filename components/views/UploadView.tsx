import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon } from '../icons/Icons';
import { UploadSource } from '../../types';

interface UploadViewProps {
  onUpload: (source: UploadSource, description: string) => void;
  onClose: () => void;
}

const UploadView: React.FC<UploadViewProps> = ({ onUpload, onClose }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isValidUrl = (url: string) => {
    try {
        new URL(url);
        const commonHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
        const commonExtensions = ['.mp4', '.mov', '.webm'];
        const lowerUrl = url.toLowerCase();
        return commonHosts.some(host => lowerUrl.includes(host)) || commonExtensions.some(ext => lowerUrl.endsWith(ext));
    } catch (_) {
        return false;
    }
  };

  const handleFileSelect = (file: File | undefined) => {
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoUrl(''); // Clear the URL input if a file is selected
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      if (file) alert("Please select or drop a valid video file.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files?.[0]);
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    // Clear file input if user starts typing a URL
    if (videoFile) {
        setVideoFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    }
  };

  const handlePost = () => {
    // Prioritize file upload if both happen to be filled
    if (videoFile) {
      onUpload({ type: 'file', data: videoFile }, description);
    } else if (isValidUrl(videoUrl)) {
      onUpload({ type: 'url', data: videoUrl }, description);
    }
  };
  
  const isPostDisabled = description.trim() === '' || (!videoFile && !isValidUrl(videoUrl));

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end sm:items-center z-50 p-0 sm:p-4">
      <div className="bg-zinc-900 rounded-t-2xl sm:rounded-lg shadow-xl w-full max-w-lg text-white relative animate-slide-in-up flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh]">
        <header className="flex justify-between items-center p-4 border-b border-zinc-800 flex-shrink-0">
          <h1 className="text-xl font-bold">Upload Video</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-[270px]">
                {previewUrl ? (
                    <div className="w-full aspect-[9/16] rounded-lg overflow-hidden bg-black mb-4">
                    <video src={previewUrl} controls className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div
                    className={`w-full aspect-[9/16] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors ${isDragging ? 'border-pink-500 bg-zinc-800' : 'border-zinc-600 hover:border-pink-500'}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    >
                    <svg className="w-12 h-12 text-zinc-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <p className="font-semibold">Drag & Drop or Tap</p>
                    <p className="text-xs text-gray-400 mt-1">to upload a video file</p>
                    </div>
                )}
                 <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            <div className="flex items-center my-4 w-full max-w-[270px]">
                <hr className="flex-grow border-zinc-700" />
                <span className="mx-4 text-gray-400 text-sm font-semibold">OR</span>
                <hr className="flex-grow border-zinc-700" />
            </div>

             <div className="w-full max-w-[270px]">
                <label htmlFor="video-url" className="block text-sm font-medium text-gray-400 mb-2 text-center">
                    Embed from URL
                </label>
                <input
                    id="video-url"
                    type="url"
                    placeholder="e.g., https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={handleUrlChange}
                    className="w-full p-2 bg-zinc-800 rounded-md border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
            </div>
        </main>

        <footer className="p-4 border-t border-zinc-800 space-y-4 flex-shrink-0">
            <textarea
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2 bg-zinc-800 rounded-md border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              onClick={handlePost}
              disabled={isPostDisabled}
              className="w-full py-3 font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
            >
              Post
            </button>
        </footer>
      </div>
    </div>
  );
};

export default UploadView;