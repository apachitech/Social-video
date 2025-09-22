import React, { useState, useMemo, useEffect } from 'react';
import { User, Badge } from '../../types';
import { SearchIcon, MoreVerticalIcon, ChevronLeftIcon, ChevronRightIcon, BanUserIcon, PauseCircleIcon, CheckCircleIcon, VerifyBadgeIcon, TrashIcon, CloseIcon, MessageIcon, SortUpIcon, SortDownIcon, BadgeIcon } from '../icons/Icons';
import AddUserModal from './AddUserModal';
import ManageUserBadgesModal from './ManageUserBadgesModal';

interface SendMessageModalProps {
    user: User;
    onClose: () => void;
    onSend: (message: string) => void;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({ user, onClose, onSend }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSend(message.trim());
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md text-gray-800 dark:text-white relative animate-fade-in-up border border-gray-200 dark:border-zinc-800"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
                    <h2 className="text-xl font-bold">Send Message to @{user.username}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                        <CloseIcon />
                    </button>
                </header>
                <main className="p-6">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        placeholder="Type your message here..."
                        className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        This message will be sent from 'Vidora Support'.
                    </p>
                </main>
                <footer className="flex justify-end gap-3 p-4 border-t dark:border-zinc-800">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors font-semibold text-sm">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="px-4 py-2 rounded-md bg-pink-600 hover:bg-pink-700 transition-colors font-semibold text-white text-sm disabled:opacity-50"
                    >
                        Send Message
                    </button>
                </footer>
            </div>
        </div>
    );
};

interface BulkMessageModalProps {
    selectedCount: number;
    onClose: () => void;
    onSend: (message: string) => void;
}

const BulkMessageModal: React.FC<BulkMessageModalProps> = ({ selectedCount, onClose, onSend }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSend(message.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md text-gray-800 dark:text-white relative animate-fade-in-up border border-gray-200 dark:border-zinc-800"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
                    <h2 className="text-xl font-bold">Send Bulk Message to {selectedCount} Users</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                        <CloseIcon />
                    </button>
                </header>
                <main className="p-6">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        placeholder="Type your message for the selected users..."
                        className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        This message will be sent individually from 'Vidora Support' to each selected user.
                    </p>
                </main>
                <footer className="flex justify-end gap-3 p-4 border-t dark:border-zinc-800">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors font-semibold text-sm">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="px-4 py-2 rounded-md bg-pink-600 hover:bg-pink-700 transition-colors font-semibold text-white text-sm disabled:opacity-50"
                    >
                        Send to All
                    </button>
                </footer>
            </div>
        </div>
    );
};

interface UserActionModalProps {
    user: User;
    onClose: () => void;
    onUpdateStatus: (userId: string, newStatus: User['status']) => void;
    onUpdateRole: (userId: string, newRole: User['role']) => void;
    onStartVerification: (user: User) => void;
    onUpdateVerification: (userId: string, isVerified: boolean) => void;
    onDeleteUser: (userId: string) => void;
    onSendMessage: (user: User) => void;
    onManageBadges: (user: User) => void;
}

const UserActionModal: React.FC<UserActionModalProps> = ({ user, onClose, onUpdateStatus, onUpdateRole, onStartVerification, onUpdateVerification, onDeleteUser, onSendMessage, onManageBadges }) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const handleDelete = () => {
        onDeleteUser(user.id);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex justify-center items-end sm:items-center z-50 p-4" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-xs text-gray-800 dark:text-white animate-slide-in-up sm:animate-fade-in-up" 
                onClick={e => e.stopPropagation()}
            >
                {isConfirmingDelete ? (
                    <div className="p-6 text-center">
                        <h3 className="font-bold text-lg mb-2">Move to Corbeil?</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            User @{user.username} will be moved to the corbeil and will be permanently deleted after 30 days.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setIsConfirmingDelete(false)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors font-semibold text-sm">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold text-white text-sm">
                                Confirm
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b border-gray-200 dark:border-zinc-700 text-center">
                            <h3 className="font-bold">Actions for @{user.username}</h3>
                        </div>
                        <div className="flex flex-col">
                             <button onClick={() => { onSendMessage(user); onClose(); }} className="flex items-center gap-3 p-4 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 w-full transition-colors">
                                <MessageIcon className="w-5 h-5 text-cyan-500" /> Send Direct Message
                            </button>
                            <button onClick={() => { onManageBadges(user); onClose(); }} className="flex items-center gap-3 p-4 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 w-full transition-colors">
                                <BadgeIcon className="w-5 h-5 text-purple-500" /> Manage Badges
                            </button>
                            {user.isVerified ? (
                                <button onClick={() => { onUpdateVerification(user.id, false); onClose(); }} className="flex items-center gap-3 p-4 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 w-full transition-colors">
                                    <VerifyBadgeIcon className="w-5 h-5 text-gray-500" /> Un-verify User
                                </button>
                            ) : (
                                <button onClick={() => { onStartVerification(user); onClose(); }} className="flex items-center gap-3 p-4 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 w-full transition-colors">
                                    <VerifyBadgeIcon className="w-5 h-5 text-blue-500" /> Verify User
                                </button>
                            )}
                            {user.status === 'active' && (
                                <>
                                    <button onClick={() => { onUpdateStatus(user.id, 'suspended'); onClose(); }} className="flex items-center gap-3 p-4 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 w-full transition-colors">
                                        <PauseCircleIcon className="w-5 h-5 text-yellow-500" /> Suspend User
                                    </button>
                                    <button onClick={() => { onUpdateStatus(user.id, 'banned'); onClose(); }} className="flex items-center gap-3 p-4 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-700 w-full transition-colors">
                                        <BanUserIcon className="w-5 h-5" /> Ban User
                                    </button>
                                </>
                            )}
                            {user.status === 'suspended' && (
                                <>
                                    <button onClick={() => { onUpdateStatus(user.id, 'active'); onClose(); }} className="flex items-center gap-3 p-4 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 w-full transition-colors">
                                        <CheckCircleIcon className="w-5 h-5 text-green-500"/> Activate User
                                    </button>
                                    <button onClick={() => { onUpdateStatus(user.id, 'banned'); onClose(); }} className="flex items-center gap-3 p-4 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-700 w-full transition-colors">
                                        <BanUserIcon className="w-5 h-5" /> Ban User
                                    </button>
                                </>
                            )}
                            {user.status === 'banned' && (
                                <button onClick={() => { onUpdateStatus(user.id, 'active'); onClose(); }} className="flex items-center gap-3 p-4 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 w-full transition-colors">
                                    <CheckCircleIcon className="w-5 h-5 text-green-500"/> Un-ban User
                                </button>
                            )}
                            <div className="p-4 border-y border-gray-200 dark:border-zinc-700">
                                <label htmlFor="role-select" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Change Role</label>
                                <select
                                    id="role-select"
                                    value={user.role}
                                    onChange={(e) => {
                                        onUpdateRole(user.id, e.target.value as User['role']);
                                        onClose();
                                    }}
                                    className="w-full p-2 bg-gray-100 dark:bg-zinc-700 rounded-md border border-gray-200 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="user">User</option>
                                    <option value="creator">Creator</option>
                                    <option value="moderator">Moderator</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button onClick={() => setIsConfirmingDelete(true)} className="flex items-center gap-3 p-4 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-700 w-full transition-colors">
                                <TrashIcon className="w-5 h-5" /> Delete User
                            </button>
                            <button onClick={onClose} className="p-3 text-center border-t border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-zinc-700 w-full transition-colors rounded-b-lg">
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: User['status'] }> = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
    const statusMap = {
        active: `bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 ${baseClasses}`,
        suspended: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 ${baseClasses}`,
        banned: `bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 ${baseClasses}`,
        deleted: `bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 ${baseClasses}`,
    };
    return <span className={statusMap[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

const BulkActionBar: React.FC<{
    selectedCount: number;
    onClearSelection: () => void;
    onUpdateStatus: (status: User['status']) => void;
    onDelete: () => void;
    onSendMessageClick: () => void;
}> = ({ selectedCount, onClearSelection, onUpdateStatus, onDelete, onSendMessageClick }) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const handleDelete = () => {
        onDelete();
        setIsConfirmingDelete(false);
    }

    if (isConfirmingDelete) {
        return (
            <div className="flex justify-between items-center mb-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg animate-fade-in-up">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Move {selectedCount} user(s) to the corbeil?
                </p>
                <div className="flex gap-2">
                    <button onClick={() => setIsConfirmingDelete(false)} className="px-3 py-1 rounded-md bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600 transition-colors font-semibold text-sm">Cancel</button>
                    <button onClick={handleDelete} className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold text-white text-sm">Confirm</button>
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
                <button onClick={onSendMessageClick} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900" title="Send Message to Selected"><MessageIcon className="w-4 h-4" />Message</button>
                <button onClick={() => onUpdateStatus('active')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 rounded-md hover:bg-green-200 dark:hover:bg-green-900" title="Activate Selected"><CheckCircleIcon className="w-4 h-4" />Activate</button>
                <button onClick={() => onUpdateStatus('suspended')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900" title="Suspend Selected"><PauseCircleIcon className="w-4 h-4" />Suspend</button>
                <button onClick={() => onUpdateStatus('banned')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900" title="Ban Selected"><BanUserIcon className="w-4 h-4" />Ban</button>
                <button onClick={() => setIsConfirmingDelete(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900" title="Delete Selected"><TrashIcon className="w-4 h-4" />Delete</button>
            </div>
        </div>
    );
};


interface UserManagementViewProps {
    users: User[];
    onAddUser: (newUser: User) => void;
    onStartVerification: (user: User) => void;
    onUpdateUserVerification: (userId: string, isVerified: boolean) => void;
    onUpdateUserStatus: (userId: string, status: User['status']) => void;
    onUpdateUserRole: (userId: string, role: User['role']) => void;
    onDeleteUser: (userId: string) => void;
    selectedUserIds: string[];
    onSetSelectedUserIds: (ids: string[]) => void;
    onBulkUpdateStatus: (ids: string[], status: User['status']) => void;
    onBulkDelete: (ids: string[]) => void;
    onSendSystemMessage: (userId: string, message: string) => void;
    onBulkSendMessage: (userIds: string[], message: string) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    availableBadges: Badge[];
    onUpdateUserBadges: (userId: string, updatedBadges: Badge[]) => void;
}


const UserManagementView: React.FC<UserManagementViewProps> = ({ 
    users, onAddUser, onStartVerification, onUpdateUserVerification, onDeleteUser, onUpdateUserStatus, onUpdateUserRole,
    selectedUserIds, onSetSelectedUserIds, onBulkUpdateStatus, onBulkDelete, onSendSystemMessage,
    onBulkSendMessage, searchTerm, onSearchTermChange, availableBadges, onUpdateUserBadges
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [actionMenuForUser, setActionMenuForUser] = useState<string | null>(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [userToMessage, setUserToMessage] = useState<User | null>(null);
    const [isBulkMessageModalOpen, setIsBulkMessageModalOpen] = useState(false);
    const [userForBadges, setUserForBadges] = useState<User | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'joinDate', direction: 'desc' });
    const usersPerPage = 7;

    const sortedUsers = useMemo(() => {
        let sortableUsers = [...users];
        if (sortConfig.key !== null) {
            sortableUsers.sort((a, b) => {
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

    const handleAddUserAndClose = (newUser: User) => {
        onAddUser(newUser);
        setIsAddUserModalOpen(false);
    };

    const filteredUsers = sortedUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Reset to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const userForModal = users.find(u => u.id === actionMenuForUser);
    
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
                        onUpdateStatus={(status) => onBulkUpdateStatus(selectedUserIds, status)}
                        onDelete={() => onBulkDelete(selectedUserIds)}
                        onSendMessageClick={() => setIsBulkMessageModalOpen(true)}
                    />
                ) : (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <div className="relative w-full md:w-auto">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => onSearchTermChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                        <button onClick={() => setIsAddUserModalOpen(true)} className="w-full md:w-auto bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-pink-700 transition-colors shrink-0">
                            Add User
                        </button>
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
                                        aria-label="Select all users on this page"
                                    />
                                </th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="username">User</SortableHeader></th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="email">Email</SortableHeader></th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="role">Role</SortableHeader></th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="status">Status</SortableHeader></th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="isVerified">Verified</SortableHeader></th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="joinDate">Joined</SortableHeader></th>
                                <th scope="col" className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map(user => (
                                <tr key={user.id} className={`border-b dark:border-zinc-800 transition-colors ${selectedUserIds.includes(user.id) ? 'bg-pink-500/10' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 text-pink-600 focus:ring-pink-500 bg-gray-100 dark:bg-zinc-900"
                                            onChange={(e) => handleSelectOne(e, user.id)}
                                            checked={selectedUserIds.includes(user.id)}
                                            aria-label={`Select user ${user.username}`}
                                        />
                                    </td>
                                    <td className="p-4 flex items-center">
                                        <img src={user.avatarUrl} alt={user.username} className="w-9 h-9 rounded-full mr-3" />
                                        <div>
                                            <div className="font-semibold text-gray-800 dark:text-white">@{user.username}</div>
                                            <div className="text-xs">{user.id}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4 capitalize">{user.role}</td>
                                    <td className="p-4"><StatusBadge status={user.status} /></td>
                                    <td className="p-4">{user.isVerified ? '✅' : '❌'}</td>
                                    <td className="p-4">{user.joinDate}</td>
                                    <td className="p-4">
                                        <button onClick={() => setActionMenuForUser(user.id)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700" aria-label={`Actions for ${user.username}`}>
                                            <MoreVerticalIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
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

            {userForModal && (
                <UserActionModal
                    user={userForModal}
                    onClose={() => setActionMenuForUser(null)}
                    onUpdateStatus={onUpdateUserStatus}
                    onUpdateRole={onUpdateUserRole}
                    onStartVerification={onStartVerification}
                    onUpdateVerification={onUpdateUserVerification}
                    onDeleteUser={onDeleteUser}
                    onSendMessage={setUserToMessage}
                    onManageBadges={setUserForBadges}
                />
            )}

            {isAddUserModalOpen && (
                <AddUserModal
                    onClose={() => setIsAddUserModalOpen(false)}
                    onAddUser={handleAddUserAndClose}
                />
            )}
            
            {userToMessage && (
                <SendMessageModal
                    user={userToMessage}
                    onClose={() => setUserToMessage(null)}
                    onSend={(message) => {
                        onSendSystemMessage(userToMessage.id, message);
                        setUserToMessage(null);
                    }}
                />
            )}
            {isBulkMessageModalOpen && (
                <BulkMessageModal
                    selectedCount={selectedUserIds.length}
                    onClose={() => setIsBulkMessageModalOpen(false)}
                    onSend={(message) => {
                        onBulkSendMessage(selectedUserIds, message);
                        setIsBulkMessageModalOpen(false);
                        onSetSelectedUserIds([]); // Clear selection after sending
                    }}
                />
            )}
            {userForBadges && (
                <ManageUserBadgesModal
                    user={userForBadges}
                    availableBadges={availableBadges}
                    onClose={() => setUserForBadges(null)}
                    onSave={onUpdateUserBadges}
                />
            )}
        </>
    );
};

export default UserManagementView;