import React, { useState } from 'react';
import { Task, Ad } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface TaskModalProps {
    task?: Task | null;
    onClose: () => void;
    onSave: (task: Task) => void;
    allAds: Ad[];
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave, allAds }) => {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [rewardType, setRewardType] = useState<Task['rewardType']>(task?.rewardType || 'coins');
    const [rewardAmount, setRewardAmount] = useState(task?.rewardAmount || '');
    const [frequency, setFrequency] = useState<Task['frequency']>(task?.frequency || 'daily');
    const [adId, setAdId] = useState(task?.adId || '');
    const [adDuration, setAdDuration] = useState(task?.adDuration || 15);
    const [adsToWatch, setAdsToWatch] = useState(task?.adsToWatch || 1);
    
    const availableVideoAds = allAds.filter(ad => ad.type === 'video');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = Number(rewardAmount);
        if (!title.trim() || !description.trim() || numAmount <= 0 || !adId || adDuration <= 0 || adsToWatch <= 0) {
            alert("Please fill all fields correctly with valid numbers.");
            return;
        }
        
        const newTask: Task = {
            id: task?.id || `task-${Date.now()}`,
            title,
            description,
            type: 'watch_ad',
            rewardType,
            rewardAmount: numAmount,
            frequency,
            adId,
            isActive: task?.isActive ?? true,
            adDuration,
            adsToWatch,
        };
        onSave(newTask);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-lg text-gray-800 dark:text-white relative animate-fade-in-up border border-gray-200 dark:border-zinc-800">
                <header className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
                    <h2 className="text-xl font-bold">{task ? 'Edit Task' : 'Add New Task'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                        <CloseIcon />
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <div className="sm:col-span-2">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Task Title</label>
                            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="rewardType" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reward Type</label>
                            <select id="rewardType" value={rewardType} onChange={e => setRewardType(e.target.value as Task['rewardType'])} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md">
                                <option value="coins">Coins</option>
                                <option value="xp">XP</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="rewardAmount" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reward Amount</label>
                            <input id="rewardAmount" type="number" value={rewardAmount} onChange={e => setRewardAmount(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Frequency</label>
                            <select id="frequency" value={frequency} onChange={e => setFrequency(e.target.value as Task['frequency'])} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md">
                                <option value="daily">Daily</option>
                                <option value="once">Once</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="adId" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ad to Watch</label>
                            <select id="adId" value={adId} onChange={e => setAdId(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required>
                                <option value="">Select a Video Ad</option>
                                {availableVideoAds.map(ad => (
                                    <option key={ad.id} value={ad.id}>{ad.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="adDuration" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ad Duration (seconds)</label>
                            <input id="adDuration" type="number" value={adDuration} onChange={e => setAdDuration(parseInt(e.target.value) || 0)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="adsToWatch" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Number of Ads to Watch</label>
                            <input id="adsToWatch" type="number" value={adsToWatch} onChange={e => setAdsToWatch(parseInt(e.target.value) || 0)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                    </main>
                    <footer className="flex justify-end gap-3 p-4 border-t dark:border-zinc-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 font-semibold text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-pink-600 hover:bg-pink-700 font-semibold text-white text-sm">Save Task</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;