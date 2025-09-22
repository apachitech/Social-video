
import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, RestoreIcon, TrashIcon, CloseIcon, SortUpIcon, SortDownIcon } from '../icons/Icons';

// Helper to calculate date difference
const differenceInDays = (date1: Date, date2: Date): number => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

interface ReviewDefenseModalProps {
    user: User;
    onClose: () => void;
    onRestore: (userId: string) => void;
    onPermanentlyDelete: (userId: string) => void;
}

const ReviewDefenseModal: React.FC<ReviewDefenseModalProps> = ({ user, onClose, onRestore, onPermanentlyDelete }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-lg text-gray-800 dark:text-white relative animate-fade-in-up border border-gray-200 dark:border-zinc-800">
                <header className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
                    <h2 className="text-xl font-bold">Review Defense for @{user.username}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                        <CloseIcon />
                    </button>
                </header>
                <main className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Review the user's defense statement below and decide whether to restore their account or proceed with permanent deletion.</p>
                    <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">User's Statement:</h4>
                        <p className="text-sm italic text-gray-500 dark:text-gray-400">
                            (Placeholder) I understand my account was flagged for violating community guidelines. It was a misunderstanding, and I can assure you it won't happen again. I have been a loyal member of this community for a long time and would appreciate a second chance.
                        </p>
                    </div>
                </main>
                <footer className="flex justify-end gap-3 p-4 border-t dark:border-zinc-800">
                    <button onClick={() => onPermanentlyDelete(user.id)} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold text-white text-sm">
                        Permanently Delete
                    </button>
                    <button onClick={() => onRestore(user.id)} className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors font-semibold text-white text-sm">
                        Restore User
                    </button>
                </footer>
            </div>
        </div>
    )
}

const BulkActionBar: React.FC<{
    selectedCount: number;
    onClearSelection: () => void;
    onRestore: () => void;
    onDelete: () => void;
}> = ({ selectedCount, onClearSelection, onRestore, onDelete }) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    if (isConfirmingDelete) {
        return (
            <div className="flex justify-between items-center mb-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg animate-fade-in-up">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Permanently delete {selectedCount} user(s)? This is irreversible.
                </p>
                <div className="flex gap-2">
                    <button onClick={() => setIsConfirmingDelete(false)} className="px-3 py-1 rounded-md bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600 transition-colors font-semibold text-sm">Cancel</button>
                    <button onClick={onDelete} className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold text-white text-sm">Confirm</button>
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
            <div className="flex items-center gap-2">
                <button onClick={onRestore} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 rounded-md hover:bg-green-200 dark:hover:bg-green-900" title="Restore Selected"><RestoreIcon className="w-4 h-4" />Restore</button>
                <button onClick={() => setIsConfirmingDelete(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900" title="Permanently Delete Selected"><TrashIcon className="w-4 h-4" />Delete Permanently</button>
            </div>
        </div>
    );
};


interface CorbeilViewProps {
    users: User[];
    onRestoreUser: (userId: string) => void;
    onPermanentlyDeleteUser: (userId: string) => void;
    selectedUserIds: string[];
    onSetSelectedUserIds: (ids: string[]) => void;
    onBulkRestore: (ids: string[]) => void;
    onBulkPermanentDelete: (ids: string[]) => void;
}

const CorbeilView: React.FC<CorbeilViewProps> = ({
    users, onRestoreUser, onPermanentlyDeleteUser, selectedUserIds, onSetSelectedUserIds, onBulkRestore, onBulkPermanentDelete
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [userForReview, setUserForReview] = useState<User | null>(null);
    const [userForPermanentDelete, setUserForPermanentDelete] = useState<User | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'deletionDate', direction: 'desc' });
    const usersPerPage = 7;

    const sortedUsers = useMemo(() => {
        let sortableUsers = [...users];
        if (sortConfig.key !== null) {
            sortableUsers.sort((a, b) => {
                if (sortConfig.key === 'daysLeft') {
                    const daysLeftA = 30 - differenceInDays(new Date(), new Date(a.deletionDate || 0));
                    const daysLeftB = 30 - differenceInDays(new Date(), new Date(b.deletionDate || 0));
                    if (daysLeftA < daysLeftB) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (daysLeftA > daysLeftB) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                }

                const aValue = a[sortConfig.key as keyof User];
                const bValue = b[sortConfig.key as keyof User];

                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableUsers;
    }, [users, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredUsers = sortedUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const pageUserIds = currentUsers.map(u => u.id);
            onSetSelectedUserIds(Array.from(new Set([...selectedUserIds, ...pageUserIds])));
        } else {
            const pageUserIds = currentUsers.map(u => u.id);
            onSetSelectedUserIds(selectedUserIds.filter(id => !pageUserIds.includes(id)));
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, userId: string) => {
        if (e.target.checked) {
            onSetSelectedUserIds([...selectedUserIds, userId]);
        } else {
            onSetSelectedUserIds(selectedUserIds.filter(id => id !== userId));
        }
    };

    const numSelectedOnPage = currentUsers.filter(u => selectedUserIds.includes(u.id)).length;
    const isAllOnPageSelected = currentUsers.length > 0 && numSelectedOnPage === currentUsers.length;
    
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
                {selectedUserIds.length > 0 ? (
                    <BulkActionBar
                        selectedCount={selectedUserIds.length}
                        onClearSelection={() => onSetSelectedUserIds([])}
                        onRestore={() => onBulkRestore(selectedUserIds)}
                        onDelete={() => onBulkPermanentDelete(selectedUserIds)}
                    />
                ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <div className="relative w-full sm:w-auto">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search deleted users..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                                     <input type="checkbox" onChange={handleSelectAll} checked={isAllOnPageSelected} className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 text-pink-600 focus:ring-pink-500 bg-gray-100 dark:bg-zinc-900" />
                                </th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="username">User</SortableHeader></th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="deletionDate">Deletion Date</SortableHeader></th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="daysLeft">Days Left</SortableHeader></th>
                                <th scope="col" className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map(user => {
                                const daysLeft = 30 - differenceInDays(new Date(), new Date(user.deletionDate || 0));
                                return (
                                <tr key={user.id} className={`border-b dark:border-zinc-800 transition-colors ${selectedUserIds.includes(user.id) ? 'bg-pink-500/10' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}>
                                    <td className="p-4">
                                        <input type="checkbox" onChange={(e) => handleSelectOne(e, user.id)} checked={selectedUserIds.includes(user.id)} className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 text-pink-600 focus:ring-pink-500 bg-gray-100 dark:bg-zinc-900"/>
                                    </td>
                                    <td className="p-4 flex items-center">
                                        <img src={user.avatarUrl} alt={user.username} className="w-9 h-9 rounded-full mr-3 shrink-0" />
                                        <div>
                                            <div className="font-semibold text-gray-800 dark:text-white">@{user.username}</div>
                                            <div className="text-xs">{user.id}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">{user.deletionDate ? new Date(user.deletionDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className={`p-4 font-semibold whitespace-nowrap ${daysLeft < 7 ? 'text-red-500' : ''}`}>{daysLeft > 0 ? `${daysLeft} days` : 'Expired'}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <button onClick={() => onRestoreUser(user.id)} className="p-2 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400" title="Restore User"><RestoreIcon /></button>
                                            <button onClick={() => setUserForReview(user)} className="px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700">Review Defense</button>
                                            <button onClick={() => setUserForPermanentDelete(user)} className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400" title="Permanently Delete"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                 <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm gap-4">
                    <span className="text-gray-500 dark:text-gray-400">
                        Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length}
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
            {userForReview && <ReviewDefenseModal user={userForReview} onClose={() => setUserForReview(null)} onRestore={onRestoreUser} onPermanentlyDelete={onPermanentlyDeleteUser} />}
            {userForPermanentDelete && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-xl text-center animate-fade-in-up w-full max-w-sm">
                        <h3 className="font-bold text-lg text-red-500 mb-2">Confirm Permanent Deletion</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to permanently delete @{userForPermanentDelete.username}? This action is irreversible.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setUserForPermanentDelete(null)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors font-semibold text-sm">
                                Cancel
                            </button>
                            <button onClick={() => { onPermanentlyDeleteUser(userForPermanentDelete.id); setUserForPermanentDelete(null); }} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold text-white text-sm">
                                Yes, Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CorbeilView;
