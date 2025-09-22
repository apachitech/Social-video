import React from 'react';
import { User, Task, TaskSettings } from '../../types';
import { ChevronLeftIcon, CoinIcon, StarIcon, CheckCircleIcon } from '../icons/Icons';

interface TasksViewProps {
    user: User;
    tasks: Task[];
    taskSettings: TaskSettings;
    onBack: () => void;
    onStartTask: (task: Task) => void;
}

const isTaskCompleted = (user: User, task: Task): boolean => {
    if (!user.completedTasks || !user.completedTasks[task.id]) {
        return false;
    }

    if (task.frequency === 'once') {
        return true;
    }

    if (task.frequency === 'daily') {
        const lastCompletion = new Date(user.completedTasks[task.id]);
        const today = new Date();
        return lastCompletion.toDateString() === today.toDateString();
    }
    
    return false;
};

const TasksView: React.FC<TasksViewProps> = ({ user, tasks, taskSettings, onBack, onStartTask }) => {

    const availableTasks = tasks.filter(task => task.isActive);

    if (!taskSettings.isEnabled) {
        return (
             <div className="h-full w-full bg-zinc-900 text-white flex flex-col">
                <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
                    <button onClick={onBack} className="mr-4"><ChevronLeftIcon /></button>
                    <h1 className="text-lg font-bold">Daily Tasks</h1>
                </header>
                <div className="flex-1 flex items-center justify-center text-center text-gray-400 p-4">
                    <p>The task system is currently disabled. Please check back later!</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-full w-full bg-zinc-900 text-white flex flex-col">
            <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
                <button onClick={onBack} className="mr-4"><ChevronLeftIcon /></button>
                <h1 className="text-lg font-bold">Daily Tasks</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-3">
                {availableTasks.length > 0 ? (
                    availableTasks.map(task => {
                        const completed = isTaskCompleted(user, task);
                        return (
                            <div key={task.id} className="bg-zinc-800 p-4 rounded-lg flex items-center gap-4">
                                <div className="p-3 bg-zinc-700 rounded-full">
                                    {task.rewardType === 'coins' 
                                        ? <CoinIcon className="w-6 h-6 text-yellow-400" />
                                        : <StarIcon className="w-6 h-6 text-purple-400" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold">{task.title}</h3>
                                    <p className="text-sm text-gray-400">{task.description}</p>
                                    <p className={`text-sm font-semibold mt-1 ${task.rewardType === 'coins' ? 'text-yellow-400' : 'text-purple-400'}`}>
                                        + {task.rewardAmount.toLocaleString()} {task.rewardType}
                                    </p>
                                </div>
                                {completed ? (
                                    <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                                        <CheckCircleIcon className="w-5 h-5"/>
                                        Completed
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => onStartTask(task)}
                                        className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                                    >
                                        Go
                                    </button>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center text-gray-400 pt-16">
                        <p>No tasks available right now. Check back later!</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TasksView;