import React, { useState } from 'react';
import { User, PaymentProvider } from '../types';
import { CloseIcon } from './icons/Icons';
import { useCurrency } from '../contexts/CurrencyContext';

const RequestPayoutModal: React.FC<{
    user: User;
    onClose: () => void;
    onSubmit: (amount: number, method: string, payoutInfo: string) => void;
    availableMethods: PaymentProvider[];
}> = ({ user, onClose, onSubmit, availableMethods }) => {
    const maxPayout = user.creatorStats?.totalEarnings ?? 0;
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<string>(availableMethods[0]?.name || '');
    const [payoutInfo, setPayoutInfo] = useState('');
    const [error, setError] = useState('');
    const formatCurrency = useCurrency();

    const handleSubmit = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (numAmount > maxPayout) {
            setError('Payout amount cannot exceed your total earnings.');
            return;
        }
        if (payoutInfo.trim() === '') {
            setError('Please provide your payout information.');
            return;
        }
        setError('');
        onSubmit(numAmount, method, payoutInfo);
    };

    const placeholderText: { [key: string]: string } = {
        'PayPal': 'your.email@example.com',
        'Bank Transfer': 'Bank Name, Account Number, Routing Number, SWIFT/BIC'
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-sm text-white relative animate-fade-in-up">
                <header className="flex items-center justify-between p-4 border-b border-zinc-700">
                    <h2 className="text-xl font-bold">Request Payout</h2>
                    <button onClick={onClose}><CloseIcon/></button>
                </header>
                <main className="p-6 space-y-4">
                    <div className="bg-zinc-700 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-400">Available for Payout</p>
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(maxPayout)}</p>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-400 mb-1">Amount (USD)</label>
                        <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full p-2 bg-zinc-700 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Payout Method</label>
                        {availableMethods.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2 bg-zinc-700 p-1 rounded-lg">
                                {availableMethods.map(m => (
                                    <button key={m.id} onClick={() => setMethod(m.name)} className={`py-2 text-sm rounded ${method === m.name ? 'bg-pink-600' : ''}`}>
                                        {m.name}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-center text-gray-400 bg-zinc-700 p-3 rounded-lg">
                                No payout methods are currently available.
                            </p>
                        )}
                    </div>
                     <div>
                        <label htmlFor="payoutInfo" className="block text-sm font-medium text-gray-400 mb-1">
                            {method ? `${method} Details` : 'Payout Information'}
                        </label>
                        <textarea id="payoutInfo" value={payoutInfo} onChange={e => setPayoutInfo(e.target.value)} rows={3} placeholder={placeholderText[method] || 'Enter your payout details'} className="w-full p-2 bg-zinc-700 rounded-md text-sm"></textarea>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </main>
                <footer className="p-4 border-t border-zinc-700">
                    <button onClick={handleSubmit} disabled={availableMethods.length === 0} className="w-full py-3 font-semibold rounded-lg bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed">Submit Request</button>
                </footer>
            </div>
        </div>
    );
};

export default RequestPayoutModal;