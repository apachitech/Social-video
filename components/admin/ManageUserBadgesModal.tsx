import React, { useState } from 'react';
import { User, Badge } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface ManageUserBadgesModalProps {
    user: User;
    availableBadges: Badge[];
    onClose: () => void;
    onSave: (userId: string, updatedBadges: Badge[]) => void;
}

const ManageUserBadgesModal: React.FC<ManageUserBadgesModalProps> = ({ user, availableBadges, onClose, onSave }) => {
    const [selectedBadgeIds, setSelectedBadgeIds] = useState<string[]>(() => 
        user.badges?.map(b => b.id) || []
    );

    const handleToggleBadge = (badgeId: string) => {
        setSelectedBadgeIds(prev =>
            prev.includes(badgeId) ? prev.filter(id => id !== badgeId) : [...prev, badgeId]
        );
    };

    const handleSave = () => {
        const updatedBadges = availableBadges.filter(b => selectedBadgeIds.includes(b.id));
        onSave(user.id, updatedBadges);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md text-gray-800 dark:text-white relative animate-fade-in-up border border-gray-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b dark:border-zinc-800">
                    <h2 className="text-xl font-bold">Manage Badges for @{user.username}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                        <CloseIcon />
                    </button>
                </header>

                <main className="flex-1 p-6 space-y-3 overflow-y-auto">
                    {availableBadges.map(badge => (
                        <label
                            key={badge.id}
                            htmlFor={`badge-${badge.id}`}
                            className="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-zinc-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <input
                                id={`badge-${badge.id}`}
                                type="checkbox"
                                checked={selectedBadgeIds.includes(badge.id)}
                                onChange={() => handleToggleBadge(badge.id)}
                                className="h-5 w-5 rounded border-gray-300 dark:border-zinc-600 text-pink-600 focus:ring-pink-500 bg-gray-100 dark:bg-zinc-900"
                            />
                            <span className="text-2xl mx-4">{badge.icon}</span>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-white">{badge.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{badge.description}</p>
                            </div>
                        </label>
                    ))}
                    {availableBadges.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No badges have been created yet. Go to the Badges section to create some.
                        </p>
                    )}
                </main>

                <footer className="flex-shrink-0 flex justify-end gap-3 p-4 border-t dark:border-zinc-800">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 font-semibold text-sm">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-md bg-pink-600 hover:bg-pink-700 font-semibold text-white text-sm"
                    >
                        Save Changes
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ManageUserBadgesModal;