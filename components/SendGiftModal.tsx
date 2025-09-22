import React, { useState } from 'react';
import { Gift } from '../types';
import { CloseIcon, ChevronLeftIcon, CoinIcon } from './icons/Icons';
import { useCurrency } from '../contexts/CurrencyContext';

interface SendGiftModalProps {
  gifts: Gift[];
  balance: number;
  onSend: (gift: Gift) => void;
  onClose: () => void;
}

const giftCategories: Gift['category'][] = ['Trending', 'Premium', 'Classic', 'Fun'];

const SendGiftModal: React.FC<SendGiftModalProps> = ({ gifts, balance, onSend, onClose }) => {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [activeCategory, setActiveCategory] = useState<Gift['category']>('Trending');
  const formatCurrency = useCurrency();

  const handleConfirmSend = () => {
    if (selectedGift) {
      onSend(selectedGift);
    }
  };
  
  const filteredGifts = gifts.filter(g => g.category === activeCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end z-50">
      <div 
        className="bg-zinc-900/80 backdrop-blur-xl rounded-t-2xl shadow-xl w-full max-w-md text-white relative animate-slide-in-up"
        style={{ maxHeight: '75vh' }}
      >
        <header className="p-4 border-b border-zinc-700/60 flex items-center justify-between sticky top-0 bg-zinc-900/80 rounded-t-2xl">
          {selectedGift ? (
            <button onClick={() => setSelectedGift(null)} className="text-gray-400 hover:text-white">
              <ChevronLeftIcon />
            </button>
          ) : (
             <div className="flex items-center gap-2">
                <div className="flex items-center text-yellow-400 bg-black/30 px-3 py-1 rounded-full">
                    <CoinIcon className="w-5 h-5 mr-1.5" />
                    <span className="font-bold">{balance.toLocaleString()}</span>
                </div>
                <button onClick={() => alert('Navigate to purchase coins screen!')} className="text-xs bg-pink-600 px-2 py-1 rounded-full font-semibold">Top up</button>
            </div>
          )}
          <h2 className="text-lg font-bold absolute left-1/2 -translate-x-1/2">
            {selectedGift ? 'Confirm Gift' : 'Send a Gift'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon />
          </button>
        </header>
        
        <div className="p-4 flex-grow overflow-y-auto">
          {selectedGift ? (
            <div className="flex flex-col items-center text-center p-4">
              <div className="text-6xl mb-2 scale-150 transform">{selectedGift.icon}</div>
              <p className="font-bold mt-4 text-lg">{selectedGift.name}</p>
              <div className="flex items-center text-yellow-400 mt-1">
                <CoinIcon className="w-4 h-4 mr-1"/>
                <span className="text-sm font-semibold">{selectedGift.price.toLocaleString()} coins</span>
              </div>
              <p className="text-sm text-gray-400 mt-4">Your balance will be { (balance - selectedGift.price).toLocaleString() } after sending.</p>
              <button
                onClick={handleConfirmSend}
                disabled={balance < selectedGift.price}
                className="w-full mt-6 py-3 font-semibold rounded-lg bg-pink-600 hover:bg-pink-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {balance < selectedGift.price ? 'Not enough coins' : `Send for ${selectedGift.price} coins`}
              </button>
            </div>
          ) : (
            <>
              <nav className="flex space-x-4 mb-4 border-b border-zinc-700/60">
                {giftCategories.map(category => (
                  <button 
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`py-2 px-1 text-sm font-semibold transition-colors ${activeCategory === category ? 'text-white border-b-2 border-pink-500' : 'text-gray-400'}`}
                  >
                    {category}
                  </button>
                ))}
              </nav>
              <div className="grid grid-cols-4 gap-4 text-center h-[280px] overflow-y-auto pr-2">
                {filteredGifts.map(gift => {
                  const isAffordable = balance >= gift.price;
                  return (
                    <button 
                      key={gift.id} 
                      onClick={() => setSelectedGift(gift)} 
                      disabled={!isAffordable}
                      className={`flex flex-col items-center p-2 rounded-lg transition-all ${isAffordable ? 'hover:bg-zinc-700/50' : 'opacity-40 grayscale'}`}
                    >
                      <span className="text-4xl">{gift.icon}</span>
                      <span className="text-xs mt-1">{gift.name}</span>
                      <div className="flex items-center text-xs font-bold text-yellow-400">
                        <CoinIcon className="w-3 h-3 mr-0.5" />
                        {gift.price}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendGiftModal;