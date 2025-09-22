
import React, { useState, useMemo } from 'react';
import { Gift } from '../../types';
import { CoinIcon, CloseIcon, PlusCircleIcon, PencilIcon, TrashIcon, SortUpIcon, SortDownIcon } from '../icons/Icons';

interface GiftManagementViewProps {
    gifts: Gift[];
    onAddGift: (gift: Gift) => void;
    onUpdateGift: (gift: Gift) => void;
    onDeleteGift: (giftId: string) => void;
}

const GiftModal: React.FC<{
    gift?: Gift | null;
    onClose: () => void;
    onSave: (gift: Gift) => void;
}> = ({ gift, onClose, onSave }) => {
    const [name, setName] = useState(gift?.name || '');
    const [price, setPrice] = useState(gift?.price || '');
    const [icon, setIcon] = useState(gift?.icon || '');
    const [category, setCategory] = useState<Gift['category']>(gift?.category || 'Classic');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numPrice = Number(price);
        if (!name || numPrice <= 0 || !icon || !category) {
            alert("Please fill all fields correctly.");
            return;
        }
        const newGift: Gift = {
            id: gift?.id || `g${Date.now()}`,
            name,
            price: numPrice,
            icon,
            category
        };
        onSave(newGift);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md text-gray-800 dark:text-white relative animate-fade-in-up border border-gray-200 dark:border-zinc-800">
                <header className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
                    <h2 className="text-xl font-bold">{gift ? 'Edit Gift' : 'Add New Gift'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                        <CloseIcon />
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Gift Name</label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Price (Coins)</label>
                            <input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="icon" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Icon (Emoji)</label>
                            <input id="icon" type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                        <div className="sm:col-span-2">
                             <label htmlFor="category" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
                            <select id="category" value={category} onChange={e => setCategory(e.target.value as Gift['category'])} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required>
                                <option>Classic</option>
                                <option>Trending</option>
                                <option>Premium</option>
                                <option>Fun</option>
                            </select>
                        </div>
                    </main>
                    <footer className="flex justify-end gap-3 p-4 border-t dark:border-zinc-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 font-semibold text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-pink-600 hover:bg-pink-700 font-semibold text-white text-sm">Save Gift</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const GiftManagementView: React.FC<GiftManagementViewProps> = ({ gifts, onAddGift, onUpdateGift, onDeleteGift }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGift, setEditingGift] = useState<Gift | null>(null);
    const [giftToDelete, setGiftToDelete] = useState<Gift | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Gift | null; direction: 'asc' | 'desc' }>({ key: 'price', direction: 'desc' });
    
    const sortedGifts = useMemo(() => {
        let sortableGifts = [...gifts];
        if (sortConfig.key !== null) {
            sortableGifts.sort((a, b) => {
                if (a[sortConfig.key!] < b[sortConfig.key!]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key!] > b[sortConfig.key!]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableGifts;
    }, [gifts, sortConfig]);

    const requestSort = (key: keyof Gift) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSaveGift = (gift: Gift) => {
        if (editingGift) {
            onUpdateGift(gift);
        } else {
            onAddGift(gift);
        }
        setEditingGift(null);
        setIsModalOpen(false);
    };

    const handleEditClick = (gift: Gift) => {
        setEditingGift(gift);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingGift(null);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (giftToDelete) {
            onDeleteGift(giftToDelete.id);
            setGiftToDelete(null);
        }
    };

    const SortableHeader: React.FC<{ children: React.ReactNode, sortKey: keyof Gift }> = ({ children, sortKey }) => (
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
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Gift Management</h2>
                    <button onClick={handleAddClick} className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-pink-700 transition-colors">
                        <PlusCircleIcon />
                        Add Gift
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="p-4">Icon</th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="name">Name</SortableHeader></th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="category">Category</SortableHeader></th>
                                <th scope="col" className="p-4"><SortableHeader sortKey="price">Price</SortableHeader></th>
                                <th scope="col" className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedGifts.map(gift => (
                                <tr key={gift.id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    <td className="p-4 text-2xl">{gift.icon}</td>
                                    <td className="p-4 font-semibold text-gray-800 dark:text-white">{gift.name}</td>
                                    <td className="p-4">{gift.category}</td>
                                    <td className="p-4 flex items-center font-semibold text-yellow-500">
                                        <CoinIcon className="w-4 h-4 mr-1" />
                                        {gift.price.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center items-center gap-4">
                                            <button onClick={() => handleEditClick(gift)} className="p-1 text-blue-500 hover:text-blue-400" title="Edit Gift"><PencilIcon /></button>
                                            <button onClick={() => setGiftToDelete(gift)} className="p-1 text-red-500 hover:text-red-400" title="Delete Gift"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <GiftModal
                    gift={editingGift}
                    onClose={() => { setIsModalOpen(false); setEditingGift(null); }}
                    onSave={handleSaveGift}
                />
            )}
             {giftToDelete && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-xl text-center animate-fade-in-up w-full max-w-sm">
                        <h3 className="font-bold text-lg text-red-500 mb-2">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to permanently delete the '{giftToDelete.name}' gift? This action is irreversible.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setGiftToDelete(null)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 font-semibold text-sm">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 font-semibold text-white text-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GiftManagementView;
