import React from 'react';
import { User, WalletTransaction, CoinPack } from '../../types';
import { ChevronLeftIcon, CoinIcon, PlusCircleIcon, GiftIcon, StarIcon, TasksIcon, ChevronRightIcon } from '../icons/Icons';
import { useCurrency } from '../../contexts/CurrencyContext';
import { View } from '../../App';

interface WalletViewProps {
  user: User;
  onBack: () => void;
  onNavigate: (view: View) => void;
  onNavigateToPurchase: (pack: CoinPack) => void;
  coinPacks: CoinPack[];
}

const TransactionIcon: React.FC<{ type: WalletTransaction['type'] }> = ({ type }) => {
    switch (type) {
        case 'purchase':
            return <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center"><PlusCircleIcon className="w-6 h-6 text-green-400" /></div>;
        case 'gift_received':
            return <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center"><GiftIcon className="w-5 h-5 text-pink-400"/></div>;
        case 'gift_sent':
            return <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">💸</div>;
        case 'reward':
            return <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center"><StarIcon className="w-5 h-5 text-yellow-400"/></div>;
        case 'task':
            return <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center"><TasksIcon className="w-5 h-5 text-cyan-400"/></div>;
        default:
            return null;
    }
};

const TransactionItem: React.FC<{ transaction: WalletTransaction }> = ({ transaction }) => {
    const isCredit = ['purchase', 'gift_received', 'reward', 'task'].includes(transaction.type);
    const amountColor = isCredit ? 'text-green-400' : 'text-red-400';
    const amountPrefix = isCredit ? '+' : '-';

    return (
        <div className="flex items-center p-3 hover:bg-zinc-800 rounded-lg transition-colors">
            <TransactionIcon type={transaction.type} />
            <div className="flex-1 ml-4">
                <p className="font-semibold text-sm">{transaction.description}</p>
                <p className="text-xs text-gray-400">{transaction.timestamp}</p>
            </div>
            <div className={`font-bold text-sm flex items-center ${amountColor}`}>
                {amountPrefix}
                <CoinIcon className="w-4 h-4 mx-1" />
                {transaction.amount.toLocaleString()}
            </div>
        </div>
    );
};

const WalletView: React.FC<WalletViewProps> = ({ user, onBack, onNavigateToPurchase, coinPacks, onNavigate }) => {
  const wallet = user.wallet;
  const formatCurrency = useCurrency();

  if (!wallet) {
    return (
      <div className="h-full w-full bg-zinc-900 text-white flex flex-col">
        <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
          <button onClick={onBack} className="mr-4">
            <ChevronLeftIcon />
          </button>
          <h1 className="text-lg font-bold">Wallet</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
            <p>No wallet data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-zinc-900 text-white flex flex-col">
      <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
        <button onClick={onBack} className="mr-4">
          <ChevronLeftIcon />
        </button>
        <h1 className="text-lg font-bold">My Wallet</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg mb-6">
            <p className="text-sm font-medium text-gray-400">Current Balance</p>
            <div className="flex items-center mt-2 text-yellow-400">
                <CoinIcon className="w-8 h-8 mr-2" />
                <h2 className="text-4xl font-bold">{wallet.balance.toLocaleString()}</h2>
            </div>
        </div>
        
        {/* Tasks Section */}
        <div className="mb-6">
            <button 
                onClick={() => onNavigate('tasks')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-lg flex justify-between items-center hover:opacity-90 transition-opacity"
            >
                <div className="flex items-center gap-3">
                    <TasksIcon className="w-6 h-6" />
                    <div>
                        <p className="font-bold text-left">Daily Tasks</p>
                        <p className="text-xs text-purple-200 text-left">Earn free coins and XP!</p>
                    </div>
                </div>
                <ChevronRightIcon />
            </button>
        </div>
        
        {/* Buy Coins Section */}
        <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Buy Coins</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {coinPacks.map(pack => (
                    <button 
                        key={pack.amount}
                        onClick={() => onNavigateToPurchase(pack)}
                        className="bg-zinc-800 p-4 rounded-lg text-left hover:bg-zinc-700 transition-colors relative overflow-hidden border border-transparent hover:border-pink-500"
                    >
                        {pack.isPopular && (
                            <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold px-4 py-0.5 rounded-bl-lg">POPULAR</div>
                        )}
                        <p className="font-bold flex items-center text-yellow-400">
                            <CoinIcon className="w-5 h-5 mr-1.5" />
                            {pack.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-300 mt-1">{pack.description}</p>
                        <p className="text-sm text-white font-semibold mt-2">{formatCurrency(pack.price)}</p>
                    </button>
                ))}
            </div>
        </div>
        
        {/* Transaction History */}
        <div>
            <h3 className="text-lg font-bold mb-2">Transaction History</h3>
            <div className="bg-zinc-800 rounded-lg">
                {wallet.transactions.map(tx => (
                    <TransactionItem key={tx.id} transaction={tx} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default WalletView;