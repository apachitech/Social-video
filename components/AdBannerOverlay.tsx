
import React, { useState, useEffect } from 'react';
import { Ad } from '../types';
import { CloseIcon } from './icons/Icons';

interface AdBannerOverlayProps {
    ad: Ad;
}

const AdBannerOverlay: React.FC<AdBannerOverlayProps> = ({ ad }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 5000); // Show ad after 5 seconds

        return () => clearTimeout(timer);
    }, [ad.id]); // Re-trigger if the ad changes

    const handleAdClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent clicks from affecting the underlying video player
        window.open(ad.content.linkUrl, '_blank', 'noopener,noreferrer');
    };
    
    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(false);
    };

    if (!isVisible || !ad.content.imageUrl) {
        return null;
    }

    return (
        <div className="absolute bottom-24 left-4 right-4 sm:left-auto sm:right-auto sm:w-80 z-10 animate-fade-in-up pointer-events-auto">
            <div className="bg-zinc-800/80 backdrop-blur-md rounded-lg p-2 shadow-lg flex items-center gap-3 relative">
                 <button 
                    onClick={handleClose}
                    className="absolute -top-2 -right-2 bg-zinc-900 rounded-full p-1 text-gray-400 hover:text-white"
                    aria-label="Close ad"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
                <img src={ad.content.imageUrl} alt={ad.name} className="w-12 h-12 object-cover rounded-md" />
                <div className="flex-1 overflow-hidden cursor-pointer" onClick={handleAdClick}>
                    <p className="text-xs text-yellow-400">Sponsored</p>
                    <p className="text-sm font-semibold text-white truncate">{ad.name}</p>
                </div>
                <button 
                    onClick={handleAdClick}
                    className="bg-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-pink-700 transition-colors"
                >
                    {ad.ctaText}
                </button>
            </div>
        </div>
    );
};

export default AdBannerOverlay;
