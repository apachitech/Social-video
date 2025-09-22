import React, { useState } from 'react';
import { Task, Ad } from '../../types';
import { PlusCircleIcon, PencilIcon, TrashIcon } from '../icons/Icons';
import TaskModal from './TaskModal';

interface TaskManagementViewProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    allAds: Ad[];
    showSuccessToast: (message: string) => void;
}

const ToggleSwitch: React.FC<{ isEnabled: boolean; onToggle: () => void; }> = ({ isEnabled, onToggle }) => {
    return (
        <button 
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isEnabled ? 'bg-pink-600' : 'bg-gray-200 dark:bg-zinc-600'}`}
            onClick={onToggle}
            aria-checked={isEnabled}
            role="switch"
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
};

const TaskManagementView: React.FC<TaskManagementViewProps> = ({ tasks, setTasks, allAds, showSuccessToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    const handleSaveTask = (task: Task) => {
        if (editingTask) {
            setTasks(prev => prev.map(t => t.id === task.id ? task : t));
            showSuccessToast('Task updated successfully!');
        } else {
            setTasks(prev => [task, ...prev]);
            showSuccessToast('New task created!');
        }
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleEditClick = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (taskToDelete) {
            setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
            showSuccessToast(`Task '${taskToDelete.title}' deleted.`);
            setTaskToDelete(null);
        }
    };

    const handleToggleActive = (taskId: string) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId ? { ...task, isActive: !task.isActive } : task
        ));
    };

    return (
        <>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Task Management</h2>
                    <button onClick={handleAddClick} className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-pink-700 transition-colors">
                        <PlusCircleIcon /> Add Task
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="p-4">Title</th>
                                <th scope="col" className="p-4">Reward</th>
                                <th scope="col" className="p-4">Frequency</th>
                                <th scope="col" className="p-4">Status</th>
                                <th scope="col" className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    <td className="p-4 font-semibold text-gray-800 dark:text-white">
                                        <p>{task.title}</p>
                                        <p className="text-xs font-normal text-gray-500 dark:text-gray-400">{task.description}</p>
                                    </td>
                                    <td className="p-4 capitalize">{task.rewardAmount} {task.rewardType}</td>
                                    <td className="p-4 capitalize">{task.frequency}</td>
                                    <td className="p-4">
                                        <ToggleSwitch isEnabled={task.isActive} onToggle={() => handleToggleActive(task.id)} />
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center items-center gap-4">
                                            <button onClick={() => handleEditClick(task)} className="p-1 text-blue-500 hover:text-blue-400" title="Edit Task"><PencilIcon /></button>
                                            <button onClick={() => setTaskToDelete(task)} className="p-1 text-red-500 hover:text-red-400" title="Delete Task"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <TaskModal
                    task={editingTask}
                    onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
                    onSave={handleSaveTask}
                    allAds={allAds}
                />
            )}
             {taskToDelete && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-xl text-center animate-fade-in-up w-full max-w-sm">
                        <h3 className="font-bold text-lg text-red-500 mb-2">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete the task '{taskToDelete.title}'? This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 font-semibold text-sm">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 font-semibold text-white text-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TaskManagementView;