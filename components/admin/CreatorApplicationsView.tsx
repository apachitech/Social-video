import React, { useState, useMemo } from 'react';
import { CreatorApplication } from '../../types';
import { SortUpIcon, SortDownIcon } from '../icons/Icons';

type ApplicationStatus = 'pending' | 'approved' | 'rejected';

const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
    const statusMap = {
        pending: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 ${baseClasses}`,
        approved: `bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 ${baseClasses}`,
        rejected: `bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 ${baseClasses}`,
    };
    return <span className={statusMap[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

interface CreatorApplicationsViewProps {
    applications: CreatorApplication[];
    onDecision: (applicationId: string, status: 'approved' | 'rejected') => void;
}

const resolvePath = (path: string, obj: any) => path.split('.').reduce((prev, curr) => prev?.[curr], obj);

const CreatorApplicationsView: React.FC<CreatorApplicationsViewProps> = ({ applications, onDecision }) => {
    const [activeTab, setActiveTab] = useState<ApplicationStatus>('pending');
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'applicationDate', direction: 'desc' });

    const filteredApps = useMemo(() =>
        applications.filter(app => app.status === activeTab),
        [applications, activeTab]
    );
    
    const sortedApps = useMemo(() => {
        let sortableApps = [...filteredApps];
        if (sortConfig.key !== null) {
            sortableApps.sort((a, b) => {
                const aValue = resolvePath(sortConfig.key!, a);
                const bValue = resolvePath(sortConfig.key!, b);

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableApps;
    }, [filteredApps, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ children: React.ReactNode, sortKey: string }> = ({ children, sortKey }) => (
        <button onClick={() => requestSort(sortKey)} className="flex items-center gap-1.5 group">
            {children}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {sortConfig.key === sortKey ? (
                    sortConfig.direction === 'asc' ? <SortUpIcon /> : <SortDownIcon />
                ) : (
                    <SortDownIcon className="text-gray-400" />
                )}
            </div>
        </button>
    );
    
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
                 <h2 className="text-xl font-bold">Creator Applications</h2>
            </div>
             <div className="flex border-b border-gray-200 dark:border-zinc-800">
                {(['pending', 'approved', 'rejected'] as ApplicationStatus[]).map(status => (
                    <button
                        key={status}
                        onClick={() => setActiveTab(status)}
                        className={`capitalize px-4 py-2 text-sm font-semibold transition-colors ${
                            activeTab === status
                            ? 'border-b-2 border-pink-500 text-pink-500'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        {status} ({applications.filter(p => p.status === status).length})
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="p-4"><SortableHeader sortKey="user.username">Applicant</SortableHeader></th>
                            <th scope="col" className="p-4"><SortableHeader sortKey="statsSnapshot.followers">Stats</SortableHeader></th>
                            <th scope="col" className="p-4">Message</th>
                            <th scope="col" className="p-4"><SortableHeader sortKey="applicationDate">Date</SortableHeader></th>
                            <th scope="col" className="p-4 text-center">Status</th>
                            {activeTab === 'pending' && <th scope="col" className="p-4 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedApps.map(app => (
                            <tr key={app.id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                <td className="p-4 flex items-center">
                                    <img src={app.user.avatarUrl} alt={app.user.username} className="w-8 h-8 rounded-full mr-3" />
                                    <span className="font-semibold text-gray-800 dark:text-white">@{app.user.username}</span>
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                    <div className="text-xs">F: <span className="font-semibold text-gray-700 dark:text-gray-300">{app.statsSnapshot.followers.toLocaleString()}</span></div>
                                    <div className="text-xs">V: <span className="font-semibold text-gray-700 dark:text-gray-300">{app.statsSnapshot.views.toLocaleString()}</span></div>
                                    <div className="text-xs">P: <span className="font-semibold text-gray-700 dark:text-gray-300">{app.statsSnapshot.videos.toLocaleString()}</span></div>
                                </td>
                                <td className="p-4 max-w-sm">
                                    <p className="text-xs line-clamp-2 italic">"{app.message}"</p>
                                </td>
                                <td className="p-4 whitespace-nowrap">{app.applicationDate}</td>
                                <td className="p-4 text-center"><StatusBadge status={app.status} /></td>
                                {activeTab === 'pending' && (
                                    <td className="p-4">
                                        <div className="flex justify-center items-center gap-2">
                                            <button onClick={() => onDecision(app.id, 'rejected')} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition-colors">
                                                Reject
                                            </button>
                                            <button onClick={() => onDecision(app.id, 'approved')} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors">
                                                Approve
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedApps.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <p>No {activeTab} applications found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorApplicationsView;