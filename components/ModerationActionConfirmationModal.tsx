import React from 'react';
import { BanUserIcon } from './icons/Icons';

interface ModerationActionConfirmationModalProps {
    username: string;
    onClose: () => void;
    onConfirm: () => void;
}

const ModerationActionConfirmationModal: React.FC<ModerationActionConfirmationModalProps> = ({ username, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[60] p-4">
            <div className="bg-zinc-800 p-6 rounded-lg shadow-xl text-center animate-fade-in-up w-full max-w-sm">
                <div className="text-red-500 mx-auto w-fit mb-4">
                    <BanUserIcon className="w-12 h-12"/>
                </div>
                <h3 className="font-bold text-lg text-red-400 mb-2">Confirm Action</h3>
                <p className="text-sm text-gray-300 mb-6">
                    Are you sure you want to ban <span className="font-bold">@{username}</span>? This will immediately end their stream and ban their account.
                </p>
                <div className="flex justify-center gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-zinc-700 hover:bg-zinc-600 transition-colors font-semibold text-sm">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold text-white text-sm">
                        Confirm Ban
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModerationActionConfirmationModal;