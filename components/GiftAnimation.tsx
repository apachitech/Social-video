import React, { useEffect } from 'react';
import { GiftEvent } from '../types';
import { CoinIcon } from './icons/Icons';

interface GiftAnimationProps {
    giftEvent: GiftEvent;
    onAnimationComplete: (id: string) => void;
}

const GiftAnimation: React.FC<GiftAnimationProps> = ({ giftEvent, onAnimationComplete }) => {
    
    useEffect(() => {
        const timer = setTimeout(() => {
            onAnimationComplete(giftEvent.id);
        }, 5000); // Animation lasts 5 seconds total

        return () => clearTimeout(timer);
    }, [giftEvent.id, onAnimationComplete]);

    return (
        <div className="animate-gift-banner w-72">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-2 shadow-lg flex items-center gap-3">
                <div className="text-4xl shrink-0">{giftEvent.gift.icon}</div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold truncate">@{giftEvent.user.username}</p>
                    <p className="text-xs text-pink-100">sent a {giftEvent.gift.name}!</p>
                </div>
                <div className="flex flex-col items-center bg-black/20 p-1 rounded-md">
                     <CoinIcon className="w-4 h-4 text-yellow-300"/>
                     <span className="text-xs font-semibold">{giftEvent.gift.price}</span>
                </div>
            </div>
        </div>
    );
};

export default GiftAnimation;