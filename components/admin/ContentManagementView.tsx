
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Video, User } from '../../types';
import { SearchIcon, MoreVerticalIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon, CheckCircleIcon, PauseCircleIcon, CloseIcon, SortUpIcon, SortDownIcon } from '../icons/Icons';
import VideoPreviewModal from './VideoPreviewModal';

const StatusBadge: React.FC<{ status: Video['status'] }> = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
    const statusMap = {
        approved: `bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 ${baseClasses}`,
        pending: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 ${baseClasses}`,
        removed: `bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 ${baseClasses}`,
    };
    return <span className={statusMap[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

const BulkActionBar: React.FC<{
    selectedCount: number;
    onClearSelection: () => void;
    onUpdateStatus: (status: Video['status']) => void;
    onDelete: () => void;
}> = ({ selectedCount, onClearSelection, onUpdateStatus, onDelete }) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    if (isConfirmingDelete) {
        return (
            <div className="flex justify-between items-center mb-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg animate-fade-in-up">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Permanently delete {selectedCount} video(s)? This is irreversible.
                </p>
                <div className="flex gap-2">
                    <button onClick={() => setIsConfirmingDelete(false)} className="px-3 py-1 rounded-md bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600 transition-colors font-semibold text-sm">Cancel</button>
                    <button onClick={() => { onDelete(); setIsConfirmingDelete(false); }} className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold text-white text-sm">Confirm</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex justify-between items-center mb-4 bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg animate-fade-in-up">
            <div className="flex items-center gap-4">
                <button onClick={onClearSelection} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-700" aria-label="Clear selection">
                    <CloseIcon />
                </button>
                <span className="font-semibold text-sm">{selectedCount} selected</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
                <button onClick={() => onUpdateStatus('approved')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 rounded-md hover:bg-green-200 dark:hover:bg-green-900" title="Approve Selected"><CheckCircleIcon className="w-4 h-4" />Approve</button>
                <button onClick={() => onUpdateStatus('pending')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900" title="Set to Pending"><PauseCircleIcon className="w-4 h-4" />Set Pending</button>
                <button onClick={() => onUpdateStatus('removed')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/50 rounded-md hover:bg-orange-200 dark:hover:bg-orange-900" title="Remove (Hide) Selected"><TrashIcon className="w-4 h-4" />Remove</button>
                <button onClick={() => setIsConfirmingDelete(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900" title="Delete Permanently Selected"><TrashIcon className="w-4 h-4" />Delete</button>
            </div>
        </div>
    );
};

interface ContentManagementViewProps {
    videos: Video[];
    onUpdateVideoStatus: (videoId: string, status: Video['status']) => void;
    onDeleteVideo: (videoId: string) => void;
    selectedVideoIds: string[];
    onSetSelectedVideoIds: (ids: string[]) => void;
    onBulkUpdateStatus: (ids: string[], status: Video['status']) => void;
    onBulkDelete: (ids: string[]) => void;
    onViewUser: (user: User) => void;
}

const resolvePath = (path: string, obj: any) => path.split('.').reduce((prev, curr) => prev?.[curr], obj);

const ContentManagementView: React.FC<ContentManagementViewProps> = ({ 
    videos, onUpdateVideoStatus, onDeleteVideo,
    selectedVideoIds, onSetSelectedVideoIds, onBulkUpdateStatus, onBulkDelete,
    onViewUser
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [actionMenuForVideo, setActionMenuForVideo] = useState<string | null>(null);
    const [videoToRemove, setVideoToRemove] = useState<Video | null>(null);
    const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
    const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'uploadDate', direction: 'desc' });
    const videosPerPage = 5;

    const sortedVideos = useMemo(() => {
        let sortableVideos = [...videos];
        if (sortConfig.key !== null) {
            sortableVideos.sort((a, b) => {
                const aValue = resolvePath(sortConfig.key!, a);
                const bValue = resolvePath(sortConfig.key!, b);
    
                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
    
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableVideos;
    }, [videos, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActionMenuForVideo(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAction = (videoId: string, status: Video['status']) => {
        onUpdateVideoStatus(videoId, status);
        setActionMenuForVideo(null);
    };

    const handleConfirmRemove = () => {
        if (videoToRemove) {
            onUpdateVideoStatus(videoToRemove.id, 'removed');
            setVideoToRemove(null);
        }
    };
    
    const handleConfirmDelete = () => {
        if (videoToDelete) {
            onDeleteVideo(videoToDelete.id);
            setVideoToDelete(null);
        }
    };

    const filteredVideos = sortedVideos.filter(video =>
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastVideo = currentPage * videosPerPage;
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
    const currentVideos = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);
    const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const pageVideoIds = currentVideos.map(v => v.id);
            onSetSelectedVideoIds(Array.from(new Set([...selectedVideoIds, ...pageVideoIds])));
        } else {
            const pageVideoIds = currentVideos.map(v => v.id);
            onSetSelectedVideoIds(selectedVideoIds.filter(id => !pageVideoIds.includes(id)));
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, videoId: string) => {
        if (e.target.checked) {
            onSetSelectedVideoIds([...selectedVideoIds, videoId]);
        } else {
            onSetSelectedVideoIds(selectedVideoIds.filter(id => id !== videoId));
        }
    };

    const numSelectedOnPage = currentVideos.filter(v => selectedVideoIds.includes(v.id)).length;
    const isAllOnPageSelected = currentVideos.length > 0 && numSelectedOnPage === currentVideos.length;

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
         <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
            {selectedVideoIds.length > 0 ? (
                 <BulkActionBar
                    selectedCount={selectedVideoIds.length}
                    onClearSelection={() => onSetSelectedVideoIds([])}
                    onUpdateStatus={(status) => onBulkUpdateStatus(selectedVideoIds, status)}
                    onDelete={() => onBulkDelete(selectedVideoIds)}
                />
            ) : (
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-full sm:w-auto">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search videos..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="p-4 w-4">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 text-pink-600 focus:ring-pink-500 bg-gray-100 dark:bg-zinc-900"
                                    onChange={handleSelectAll}
                                    checked={isAllOnPageSelected}
                                    aria-label="Select all videos on this page"
                                />
                            </th>
                            <th scope="col" className="p-4"><SortableHeader sortKey="description">Video</SortableHeader></th>
                            <th scope="col" className="p-4"><SortableHeader sortKey="user.username">Author</SortableHeader></th>
                            <th scope="col" className="p-4"><SortableHeader sortKey="likes">Stats</SortableHeader></th>
                            <th scope="col" className="p-4"><SortableHeader sortKey="status">Status</SortableHeader></th>
                            <th scope="col" className="p-4"><SortableHeader sortKey="uploadDate">Upload Date</SortableHeader></th>
                            <th scope="col" className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentVideos.map(video => (
                            <tr key={video.id} className={`border-b dark:border-zinc-800 transition-colors ${selectedVideoIds.includes(video.id) ? 'bg-pink-500/10' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}>
                                 <td className="p-4">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 text-pink-600 focus:ring-pink-500 bg-gray-100 dark:bg-zinc-900"
                                        onChange={(e) => handleSelectOne(e, video.id)}
                                        checked={selectedVideoIds.includes(video.id)}
                                        aria-label={`Select video ${video.id}`}
                                    />
                                </td>
                                <td className="p-4">
                                    <button onClick={() => setPreviewVideo(video)} className="flex items-center text-left hover:opacity-80 transition-opacity">
                                        <img src={video.thumbnailUrl} alt="thumbnail" className="w-16 h-16 object-cover rounded-md mr-4 shrink-0" />
                                        <p className="font-semibold text-gray-800 dark:text-white max-w-xs truncate">{video.description}</p>
                                    </button>
                                </td>
                                <td className="p-4">
                                    <button onClick={() => onViewUser(video.user)} className="flex items-center gap-2 group">
                                        <img src={video.user.avatarUrl} alt={video.user.username} className="w-8 h-8 rounded-full" />
                                        <span className="font-semibold group-hover:text-pink-400 transition-colors">@{video.user.username}</span>
                                    </button>
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                    <div>❤️ {video.likes.toLocaleString()}</div>
                                    <div>💬 {video.comments.toLocaleString()}</div>
                                </td>
                                <td className="p-4"><StatusBadge status={video.status} /></td>
                                <td className="p-4 whitespace-nowrap">{video.uploadDate}</td>
                                <td className="p-4 relative">
                                    <button onClick={() => setActionMenuForVideo(video.id)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700" aria-label={`Actions for video ${video.id}`}>
                                        <MoreVerticalIcon />
                                    </button>
                                    {actionMenuForVideo === video.id && (
                                        <div ref={actionMenuRef} className="absolute right-4 top-12 mt-2 w-52 bg-white dark:bg-zinc-800 rounded-md shadow-lg z-10 border dark:border-zinc-700 py-1">
                                            <button onClick={() => handleAction(video.id, 'approved')} disabled={video.status === 'approved'} className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:opacity-50">
                                                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> Approve
                                            </button>
                                            <button onClick={() => handleAction(video.id, 'pending')} disabled={video.status === 'pending'} className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:opacity-50">
                                                <PauseCircleIcon className="w-4 h-4 mr-2 text-yellow-500" /> Set to Pending
                                            </button>
                                            <button onClick={() => { setVideoToRemove(video); setActionMenuForVideo(null); }} disabled={video.status === 'removed'} className="flex items-center w-full px-4 py-2 text-sm text-left text-orange-500 hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:opacity-50">
                                                <TrashIcon className="w-4 h-4 mr-2" /> Remove (Hide)
                                            </button>
                                            <div className="my-1 border-t border-gray-200 dark:border-zinc-700"></div>
                                            <button onClick={() => { setVideoToDelete(video); setActionMenuForVideo(null); }} className="flex items-center w-full px-4 py-2 text-sm font-semibold text-left text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-700">
                                                <TrashIcon className="w-4 h-4 mr-2" /> Delete Permanently
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm gap-4">
                <span className="text-gray-500 dark:text-gray-400">
                     Showing {indexOfFirstVideo + 1}-{Math.min(indexOfLastVideo, filteredVideos.length)} of {filteredVideos.length}
                </span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50">
                        <ChevronLeftIcon className="w-5 h-5"/>
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50">
                         <ChevronRightIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
        
        {previewVideo && (
            <VideoPreviewModal video={previewVideo} onClose={() => setPreviewVideo(null)} />
        )}

        {videoToRemove && (
            <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-xl text-center animate-fade-in-up w-full max-w-sm">
                    <h3 className="font-bold text-lg mb-2">Confirm Removal</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to remove this video? This will change its status to 'removed' but won't permanently delete it.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button onClick={() => setVideoToRemove(null)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors font-semibold text-sm">
                            Cancel
                        </button>
                        <button onClick={handleConfirmRemove} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold text-white text-sm">
                            Confirm Remove
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        {videoToDelete && (
            <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-xl text-center animate-fade-in-up w-full max-w-sm">
                    <h3 className="font-bold text-lg text-red-500 mb-2">Confirm Permanent Deletion</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to permanently delete this video? This action is irreversible and the video will be removed from the system.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button onClick={() => setVideoToDelete(null)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors font-semibold text-sm">
                            Cancel
                        </button>
                        <button onClick={handleConfirmDelete} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold text-white text-sm">
                            Yes, Delete Permanently
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default ContentManagementView;
