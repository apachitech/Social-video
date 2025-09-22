
import React, { useState, useMemo } from 'react';
import { Report, User, Video } from '../../types';
import { UsersIcon, VideoIcon, CommentIcon, CloseIcon, SortUpIcon, SortDownIcon } from '../icons/Icons';

type ReportStatus = 'pending' | 'resolved' | 'dismissed';

interface ModerationQueueViewProps {
    reports: Report[];
    users: User[];
    videos: Video[];
    onResolveReport: (reportId: string) => void;
    onDismissReport: (reportId: string) => void;
    selectedReportIds: string[];
    onSetSelectedReportIds: (ids: string[]) => void;
    onBulkResolve: (ids: string[]) => void;
    onBulkDismiss: (ids: string[]) => void;
}

const ContentPreview: React.FC<{ report: Report; users: User[]; videos: Video[] }> = ({ report, users, videos }) => {
    switch (report.contentType) {
        case 'user':
            const user = users.find(u => u.id === report.contentId);
            if (!user) return <div className="text-xs text-red-500">User not found</div>;
            return (
                <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full" />
                    <span className="font-semibold text-gray-800 dark:text-white">@{user.username}</span>
                </div>
            );
        case 'video':
            const video = videos.find(v => v.id === report.contentId);
            if (!video) return <div className="text-xs text-red-500">Video not found</div>;
            return (
                <div className="flex items-center gap-2">
                    <VideoIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <img src={video.thumbnailUrl} alt={video.description} className="w-12 h-12 object-cover rounded-md" />
                    <p className="text-xs line-clamp-2">{video.description}</p>
                </div>
            );
        case 'comment':
             for (const vid of videos) {
                const comment = vid.commentsData.find(c => c.id === report.contentId);
                if (comment) {
                    return (
                        <div className="flex items-start gap-2">
                            <CommentIcon className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                            <p className="text-xs italic bg-gray-100 dark:bg-zinc-800/50 p-2 rounded-md">"{comment.text}"</p>
                        </div>
                    );
                }
            }
            return <div className="text-xs text-red-500">Comment not found</div>;
        default:
            return null;
    }
};

const ConfirmationModal: React.FC<{
    report?: Report;
    count?: number;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ report, count, onClose, onConfirm }) => {
    const actionTextMap = {
        video: "remove the video",
        user: "suspend the user",
        comment: "delete the comment"
    };

    const isBulk = count && count > 0;
    const title = isBulk ? "Confirm Bulk Resolution" : "Confirm Resolution";
    const message = isBulk 
        ? `This action will resolve ${count} report(s) and apply consequences to the associated content or users. Are you sure?`
        : `Resolving this report will ${actionTextMap[report!.contentType]} and mark the report as resolved. Are you sure?`;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-xl text-center animate-fade-in-up w-full max-w-sm">
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {message}
                </p>
                <div className="flex justify-center gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors font-semibold text-sm">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors font-semibold text-white text-sm">
                        Confirm & Resolve
                    </button>
                </div>
            </div>
        </div>
    );
}

const BulkActionBar: React.FC<{
    selectedCount: number;
    onClearSelection: () => void;
    onResolve: () => void;
    onDismiss: () => void;
}> = ({ selectedCount, onClearSelection, onResolve, onDismiss }) => {
    return (
        <div className="flex justify-between items-center bg-gray-100 dark:bg-zinc-800 p-3 rounded-t-lg animate-fade-in-up">
            <div className="flex items-center gap-4">
                <button onClick={onClearSelection} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-700" aria-label="Clear selection">
                    <CloseIcon />
                </button>
                <span className="font-semibold text-sm">{selectedCount} selected</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onDismiss} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors">Dismiss Selected</button>
                <button onClick={onResolve} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors">Resolve Selected</button>
            </div>
        </div>
    );
};

const resolvePath = (path: string, obj: any) => path.split('.').reduce((prev, curr) => prev?.[curr], obj);

const ModerationQueueView: React.FC<ModerationQueueViewProps> = ({ 
    reports, users, videos, onResolveReport, onDismissReport,
    selectedReportIds, onSetSelectedReportIds, onBulkResolve, onBulkDismiss
}) => {
    const [activeTab, setActiveTab] = useState<ReportStatus>('pending');
    const [reportToConfirm, setReportToConfirm] = useState<Report | null>(null);
    const [isConfirmingBulkResolve, setIsConfirmingBulkResolve] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'timestamp', direction: 'desc' });

    const filteredReports = useMemo(() =>
        reports.filter(r => r.status === activeTab),
        [reports, activeTab]
    );

    const sortedReports = useMemo(() => {
        let sortableReports = [...filteredReports];
        if (sortConfig.key !== null) {
            sortableReports.sort((a, b) => {
                const aValue = resolvePath(sortConfig.key!, a);
                const bValue = resolvePath(sortConfig.key!, b);

                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableReports;
    }, [filteredReports, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleConfirmResolution = () => {
        if (reportToConfirm) {
            onResolveReport(reportToConfirm.id);
            setReportToConfirm(null);
        }
    }
    
    const handleConfirmBulkResolution = () => {
        onBulkResolve(selectedReportIds);
        setIsConfirmingBulkResolve(false);
    }

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const pageReportIds = sortedReports.map(r => r.id);
            onSetSelectedReportIds(Array.from(new Set([...selectedReportIds, ...pageReportIds])));
        } else {
            const pageReportIds = sortedReports.map(r => r.id);
            onSetSelectedReportIds(selectedReportIds.filter(id => !pageReportIds.includes(id)));
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, reportId: string) => {
        if (e.target.checked) {
            onSetSelectedReportIds([...selectedReportIds, reportId]);
        } else {
            onSetSelectedReportIds(selectedReportIds.filter(id => id !== reportId));
        }
    };

    const numSelectedOnPage = sortedReports.filter(r => selectedReportIds.includes(r.id)).length;
    const isAllOnPageSelected = sortedReports.length > 0 && numSelectedOnPage === sortedReports.length;
    
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
        <>
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
                {selectedReportIds.length > 0 && activeTab === 'pending' ? (
                     <BulkActionBar
                        selectedCount={selectedReportIds.length}
                        onClearSelection={() => onSetSelectedReportIds([])}
                        onResolve={() => setIsConfirmingBulkResolve(true)}
                        onDismiss={() => onBulkDismiss(selectedReportIds)}
                    />
                ) : (
                    <div className="flex border-b border-gray-200 dark:border-zinc-800">
                        {(['pending', 'resolved', 'dismissed'] as ReportStatus[]).map(status => (
                            <button
                                key={status}
                                onClick={() => { setActiveTab(status); onSetSelectedReportIds([]); }}
                                className={`capitalize px-4 py-2 text-sm font-semibold transition-colors ${
                                    activeTab === status
                                    ? 'border-b-2 border-pink-500 text-pink-500'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                            >
                                {status} ({reports.filter(r => r.status === status).length})
                            </button>
                        ))}
                    </div>
                )}


                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-400">
                            <tr>
                                {activeTab === 'pending' && (
                                    <th scope="col" className="p-4 w-4">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 text-pink-600 focus:ring-pink-500 bg-gray-100 dark:bg-zinc-900"
                                            onChange={handleSelectAll}
                                            checked={isAllOnPageSelected}
                                            aria-label="Select all reports on this page"
                                        />
                                    </th>
                                )}
                                <th scope="col" className="p-4">Reported Content</th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="reason">Reason</SortableHeader></th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="reportedBy.username">Reported By</SortableHeader></th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="timestamp">Date</SortableHeader></th>
                                {activeTab === 'pending' && <th scope="col" className="p-4 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedReports.map(report => (
                                <tr key={report.id} className={`border-b dark:border-zinc-800 transition-colors ${selectedReportIds.includes(report.id) ? 'bg-pink-500/10' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}>
                                    {activeTab === 'pending' && (
                                         <td className="p-4">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 text-pink-600 focus:ring-pink-500 bg-gray-100 dark:bg-zinc-900"
                                                onChange={(e) => handleSelectOne(e, report.id)}
                                                checked={selectedReportIds.includes(report.id)}
                                                aria-label={`Select report ${report.id}`}
                                            />
                                        </td>
                                    )}
                                    <td className="p-4 min-w-[250px]">
                                        <ContentPreview report={report} users={users} videos={videos} />
                                    </td>
                                    <td className="p-4 font-semibold">{report.reason}</td>
                                    <td className="p-4">@{report.reportedBy.username}</td>
                                    <td className="p-4 whitespace-nowrap">{new Date(report.timestamp).toLocaleDateString()}</td>
                                    {activeTab === 'pending' && (
                                        <td className="p-4">
                                            <div className="flex justify-center items-center gap-2">
                                                <button onClick={() => onDismissReport(report.id)} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors">
                                                    Dismiss
                                                </button>
                                                <button onClick={() => setReportToConfirm(report)} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors">
                                                    Resolve
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {sortedReports.length === 0 && (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            <p>No {activeTab} reports found.</p>
                        </div>
                    )}
                </div>
            </div>
            {reportToConfirm && (
                <ConfirmationModal 
                    report={reportToConfirm}
                    onClose={() => setReportToConfirm(null)}
                    onConfirm={handleConfirmResolution}
                />
            )}
             {isConfirmingBulkResolve && (
                <ConfirmationModal 
                    count={selectedReportIds.length}
                    onClose={() => setIsConfirmingBulkResolve(false)}
                    onConfirm={handleConfirmBulkResolution}
                />
            )}
        </>
    );
};

export default ModerationQueueView;
