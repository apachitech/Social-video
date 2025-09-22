import React, { useState } from 'react';
import { ChevronLeftIcon, CoinIcon } from '../icons/Icons';
import { useCurrency } from '../../contexts/CurrencyContext';
import { CoinPack, PaymentProvider } from '../../types';

interface PurchaseCoinsViewProps {
    pack: CoinPack;
    onBack: () => void;
    onPurchaseComplete: (amount: number, description: string) => void;
    availableMethods: PaymentProvider[];
}

const paymentIcons: { [key: string]: string } = {
    'Card': '💳',
    'PayPal': '🅿️',
    'Google Pay': '🇬',
    'Mobile Money': '📱',
    'Payoneer': '℗',
};

const PurchaseCoinsView: React.FC<PurchaseCoinsViewProps> = ({ pack, onBack, onPurchaseComplete, availableMethods }) => {
    const [selectedMethod, setSelectedMethod] = useState<string | null>(availableMethods[0]?.id || null);
    const [isProcessing, setIsProcessing] = useState(false);
    const formatCurrency = useCurrency();

    const handlePurchase = () => {
        if (!selectedMethod) {
            alert('Please select a payment method.');
            return;
        }
        setIsProcessing(true);
        // Simulate API call
        setTimeout(() => {
            alert(`Purchase of ${pack.description} successful!`);
            onPurchaseComplete(pack.amount, pack.description);
            // The view will be changed by the parent component
        }, 1500);
    };

    const formattedPrice = formatCurrency(pack.price);

    return (
        <div className="h-full w-full bg-zinc-900 text-white flex flex-col">
            <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
                <button onClick={onBack} className="mr-4" disabled={isProcessing}>
                    <ChevronLeftIcon />
                </button>
                <h1 className="text-lg font-bold">Checkout</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-zinc-800 p-6 rounded-lg mb-6 text-center">
                    <p className="text-gray-400">You are purchasing</p>
                    <p className="font-bold text-2xl flex items-center justify-center text-yellow-400 my-2">
                        <CoinIcon className="w-7 h-7 mr-2" />
                        {pack.amount.toLocaleString()} Coins
                    </p>
                    <p className="text-xl font-semibold">Total: {formattedPrice}</p>
                </div>

                <div>
                    <h3 className="text-lg font-bold mb-3">Select Payment Method</h3>
                    <div className="space-y-2">
                        {availableMethods.map(method => (
                            <button
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${selectedMethod === method.id ? 'border-pink-500 bg-pink-500/10' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'}`}
                            >
                                <span className="text-2xl mr-4">{paymentIcons[method.name] || '💵'}</span>
                                <span className="font-semibold">{method.name}</span>
                                {selectedMethod === method.id && (
                                    <div className="ml-auto w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    </div>
                                )}
                            </button>
                        ))}
                         {availableMethods.length === 0 && (
                            <div className="text-center text-gray-400 p-4 bg-zinc-800 rounded-lg">
                                No payment methods are available at this time.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="p-4 border-t border-zinc-800">
                <button
                    onClick={handlePurchase}
                    disabled={isProcessing || !selectedMethod}
                    className="w-full py-3 font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
                >
                    {isProcessing ? 'Processing...' : `Pay ${formattedPrice}`}
                </button>
            </footer>
        </div>
    );
};

export default PurchaseCoinsView;