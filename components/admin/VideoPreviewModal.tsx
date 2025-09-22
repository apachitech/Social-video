
import React from 'react';
import { Video } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface VideoPreviewModalProps {
    video: Video;
    onClose: () => void;
}

const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({ video, onClose }) => {
    const videoUrl = video.videoSources[0]?.url;

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md text-gray-800 dark:text-white relative animate-fade-in-up border border-gray-200 dark:border-zinc-800"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
                    <h2 className="text-xl font-bold truncate pr-8">Preview: {video.description}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                        <CloseIcon />
                    </button>
                </header>
                <main className="p-4 bg-black">
                    {videoUrl ? (
                        <video
                            src={videoUrl}
                            controls
                            autoPlay
                            playsInline
                            className="w-full max-h-[60vh] object-contain"
                        />
                    ) : (
                        <div className="w-full h-64 flex items-center justify-center text-red-500">
                            Video source not available.
                        </div>
                    )}
                </main>
                 <footer className="p-4 text-sm text-gray-500 dark:text-gray-400">
                    <p><strong>Uploader:</strong> @{video.user.username}</p>
                    <p><strong>Video ID:</strong> {video.id}</p>
                 </footer>
            </div>
        </div>
    );
};

export default VideoPreviewModal;
