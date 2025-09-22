import React, { useState } from 'react';
import { Badge } from '../../types';
import { PlusCircleIcon, PencilIcon, TrashIcon, CloseIcon } from '../icons/Icons';

interface BadgeManagementViewProps {
    badges: Badge[];
    setBadges: React.Dispatch<React.SetStateAction<Badge[]>>;
    showSuccessToast: (message: string) => void;
}

const BadgeModal: React.FC<{
    badge?: Badge | null;
    onClose: () => void;
    onSave: (badge: Badge) => void;
}> = ({ badge, onClose, onSave }) => {
    const [name, setName] = useState(badge?.name || '');
    const [icon, setIcon] = useState(badge?.icon || '');
    const [description, setDescription] = useState(badge?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !icon.trim() || !description.trim()) {
            alert("All fields are required.");
            return;
        }
        const newBadge: Badge = {
            id: badge?.id || `b-${Date.now()}`,
            name,
            icon,
            description,
        };
        onSave(newBadge);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md text-gray-800 dark:text-white relative animate-fade-in-up border border-gray-200 dark:border-zinc-800">
                <header className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
                    <h2 className="text-xl font-bold">{badge ? 'Edit Badge' : 'Add New Badge'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                        <CloseIcon />
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Badge Name</label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="icon" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Icon (Emoji)</label>
                            <input id="icon" type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                    </main>
                    <footer className="flex justify-end gap-3 p-4 border-t dark:border-zinc-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 font-semibold text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-pink-600 hover:bg-pink-700 font-semibold text-white text-sm">Save Badge</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


const BadgeManagementView: React.FC<BadgeManagementViewProps> = ({ badges, setBadges, showSuccessToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
    const [badgeToDelete, setBadgeToDelete] = useState<Badge | null>(null);

    const handleSaveBadge = (badge: Badge) => {
        if (editingBadge) {
            setBadges(prev => prev.map(b => b.id === badge.id ? badge : b));
            showSuccessToast(`Badge '${badge.name}' updated.`);
        } else {
            setBadges(prev => [badge, ...prev]);
            showSuccessToast(`Badge '${badge.name}' created.`);
        }
        setIsModalOpen(false);
        setEditingBadge(null);
    };

    const handleEditClick = (badge: Badge) => {
        setEditingBadge(badge);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingBadge(null);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (badgeToDelete) {
            setBadges(prev => prev.filter(b => b.id !== badgeToDelete.id));
            showSuccessToast(`Badge '${badgeToDelete.name}' deleted.`);
            setBadgeToDelete(null);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Badge Management</h2>
                    <button onClick={handleAddClick} className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-pink-700 transition-colors">
                        <PlusCircleIcon /> Add Badge
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="p-4">Icon</th>
                                <th scope="col" className="p-4">Name</th>
                                <th scope="col" className="p-4">Description</th>
                                <th scope="col" className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {badges.map(badge => (
                                <tr key={badge.id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    <td className="p-4 text-3xl">{badge.icon}</td>
                                    <td className="p-4 font-semibold text-gray-800 dark:text-white">{badge.name}</td>
                                    <td className="p-4">{badge.description}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center items-center gap-4">
                                            <button onClick={() => handleEditClick(badge)} className="p-1 text-blue-500 hover:text-blue-400" title="Edit Badge"><PencilIcon /></button>
                                            <button onClick={() => setBadgeToDelete(badge)} className="p-1 text-red-500 hover:text-red-400" title="Delete Badge"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <BadgeModal
                    badge={editingBadge}
                    onClose={() => { setIsModalOpen(false); setEditingBadge(null); }}
                    onSave={handleSaveBadge}
                />
            )}

            {badgeToDelete && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-xl text-center animate-fade-in-up w-full max-w-sm">
                        <h3 className="font-bold text-lg text-red-500 mb-2">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete the '{badgeToDelete.name}' badge? This will remove it from all users who have it.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setBadgeToDelete(null)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 font-semibold text-sm">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 font-semibold text-white text-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BadgeManagementView;