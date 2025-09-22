import React from 'react';
import { HomeIcon, LiveIcon, AddIcon, InboxIcon, ProfileIcon } from './icons/Icons';
import { View } from '../App';

interface BottomNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
  onNavigateToUpload: () => void;
  isVisible: boolean;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full text-xs transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`}>
    {icon}
    <span className="mt-1">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, onNavigateToUpload, isVisible }) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 h-16 bg-zinc-900 border-t border-zinc-800 grid grid-cols-5 items-center z-20 transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
      <NavItem
        label="Home"
        icon={<HomeIcon isFilled={activeView === 'feed'} />}
        isActive={activeView === 'feed'}
        onClick={() => onNavigate('feed')}
      />
      <NavItem
        label="Live"
        icon={<LiveIcon isFilled={activeView === 'live'} />}
        isActive={activeView === 'live'}
        onClick={() => onNavigate('live')}
      />
      <button onClick={onNavigateToUpload} className="flex items-center justify-center w-full h-full">
        <div className="w-12 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
            <AddIcon />
        </div>
      </button>
      <NavItem
        label="Inbox"
        icon={<InboxIcon isFilled={activeView === 'inbox'} />}
        isActive={activeView === 'inbox'}
        onClick={() => onNavigate('inbox')}
      />
      <NavItem
        label="Profile"
        icon={<ProfileIcon isFilled={activeView === 'profile' || activeView === 'wallet'} />}
        isActive={activeView === 'profile' || activeView === 'wallet'}
        onClick={() => onNavigate('profile')}
      />
    </nav>
  );
};

export default BottomNav;