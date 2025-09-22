
import React from 'react';
import { User, PayoutRequest } from '../../types';
import { ChevronLeftIcon, DollarSignIcon, UsersIcon, GiftIcon, BankIcon } from '../icons/Icons';
import { useCurrency } from '../../contexts/CurrencyContext';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-zinc-800 p-4 rounded-lg shadow-lg flex items-center gap-4">
        <div className="bg-zinc-700 p-3 rounded-full">{icon}</div>
        <div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);

const PayoutStatusBadge: React.FC<{ status: PayoutRequest['status'] }> = ({ status }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full";
    const statusMap = {
        pending: `bg-yellow-500/20 text-yellow-400 ${baseClasses}`,
        approved: `bg-green-500/20 text-green-400 ${baseClasses}`,
        rejected: `bg-red-500/20 text-red-400 ${baseClasses}`,
    };
    return <span className={statusMap[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

const PayoutMethodIcon: React.FC<{ method: string }> = ({ method }) => {
    switch (method.toLowerCase()) {
        case 'bank':
            return <BankIcon className="w-5 h-5 text-cyan-400" />;
        case 'paypal':
            return <DollarSignIcon className="w-5 h-5 text-blue-400" />;
        default:
            return <DollarSignIcon className="w-5 h-5 text-gray-400" />;
    }
};

const PayoutHistoryItem: React.FC<{ payout: PayoutRequest }> = ({ payout }) => {
    const formatCurrency = useCurrency();
    return (
        <div className="flex items-center p-3 bg-zinc-800 rounded-lg gap-3">
            <div className="p-3 bg-zinc-700/50 rounded-full">
                <PayoutMethodIcon method={payout.method} />
            </div>
            <div className="flex-1">
                <p className="font-semibold text-sm capitalize">Payout to {payout.method}</p>
                <p className="text-xs text-gray-400">
                    Requested: {payout.requestDate}
                    {payout.processedDate && ` | Processed: ${payout.processedDate}`}
                </p>
            </div>
            <div className="text-right">
                <p className="font-bold text-sm">{formatCurrency(payout.amount)}</p>
                <PayoutStatusBadge status={payout.status} />
            </div>
        </div>
    );
};

interface CreatorDashboardViewProps {
  user: User;
  payouts: PayoutRequest[];
  onBack: () => void;
  onOpenRequestPayout: () => void;
}

const CreatorDashboardView: React.FC<CreatorDashboardViewProps> = ({ 
    user, payouts, onBack, onOpenRequestPayout
}) => {
  const formatCurrency = useCurrency();

  return (
    <div className="h-full w-full bg-zinc-900 text-white flex flex-col">
        <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
            <button onClick={onBack} className="mr-4"><ChevronLeftIcon /></button>
            <h1 className="text-lg font-bold">Creator Dashboard</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Total Earnings" value={formatCurrency(user.creatorStats?.totalEarnings ?? 0)} icon={<DollarSignIcon className="text-green-400" />} />
                <StatCard title="Followers" value={user.followers?.toLocaleString() ?? '0'} icon={<UsersIcon className="text-blue-400" />} />
                <StatCard title="Gifts Received" value={user.creatorStats?.receivedGiftsCount.toLocaleString() ?? '0'} icon={<GiftIcon className="text-pink-400" />} />
                <StatCard title="Next Payout" value={formatCurrency(0)} icon={<BankIcon className="text-gray-400" />} />
            </div>
            
            <div>
                <button onClick={onOpenRequestPayout} className="w-full py-3 font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-red-500">
                    Request Payout
                </button>
            </div>
            
            <div>
                <h2 className="text-xl font-bold mb-3">Payout History</h2>
                <div className="space-y-2">
                    {payouts.length > 0 ? (
                        payouts.map(payout => (
                            <PayoutHistoryItem key={payout.id} payout={payout} />
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 bg-zinc-800 rounded-lg">
                            <p>No payout history.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    </div>
  );
};

export default CreatorDashboardView;
