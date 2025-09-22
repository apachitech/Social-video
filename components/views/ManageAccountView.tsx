import React from 'react';
import { User } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';
import { View } from '../../App';

interface ManageAccountViewProps {
  user: User;
  onBack: () => void;
  onOpenDeleteModal: () => void;
  onNavigate: (view: View) => void;
}

const SettingsItem: React.FC<{ label: string, value?: string, onClick?: () => void }> = ({ label, value, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex justify-between items-center p-4 ${onClick ? 'cursor-pointer hover:bg-zinc-700' : ''} border-b border-zinc-700 last:border-b-0 first:rounded-t-lg last:rounded-b-lg transition-colors`}
  >
    <span className="text-white">{label}</span>
    <div className="flex items-center">
        {value && <span className="text-gray-400 mr-2">{value}</span>}
        {onClick && <ChevronRightIcon />}
    </div>
  </div>
);

const ManageAccountView: React.FC<ManageAccountViewProps> = ({ user, onBack, onOpenDeleteModal, onNavigate }) => {
  return (
    <div className="h-full w-full bg-zinc-900 text-white overflow-y-auto pb-16">
      <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
        <button onClick={onBack} className="mr-4">
          <ChevronLeftIcon />
        </button>
        <h1 className="text-lg font-bold">Manage Account</h1>
      </header>

      <div className="p-4">
        <div className="bg-zinc-800 rounded-lg mb-6">
            <SettingsItem label="Email" value={user.email} />
            <SettingsItem label="Username" value={`@${user.username}`} />
        </div>

        <div className="bg-zinc-800 rounded-lg mb-6">
            <SettingsItem label="Change Password" onClick={() => onNavigate('changePassword')} />
        </div>

        <div className="bg-zinc-800 rounded-lg">
            <div 
                onClick={onOpenDeleteModal}
                className="flex justify-center items-center p-4 cursor-pointer hover:bg-zinc-700 rounded-lg transition-colors"
            >
                <span className="text-red-500 font-semibold">Delete Account</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAccountView;