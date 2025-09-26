import React, { useState, useEffect, useRef } from 'react';
import { User, Video, Report, PayoutRequest, Gift, MonetizationSettings, CreatorApplication, CoinPack, DailyRewardSettings, Ad, AdSettings, Badge, Task, TaskSettings } from '../types';
import { mockUsers, mockVideos, mockReports, mockPayoutRequests, mockGifts, mockAds, mockBadges, mockTasks } from '../services/mockApi';
import { DashboardIcon, UsersIcon, VideoIcon, ShieldCheckIcon, DollarSignIcon, GiftIcon, RestoreIcon, SettingsIcon, LogOutIcon, ProfileIcon, StarIcon, MegaphoneIcon, BadgeIcon, TasksIcon } from './icons/Icons';
import DashboardView from './admin/DashboardView';
import UserManagementView from './admin/UserManagementView';
import ContentManagementView from './admin/ContentManagementView';
import ModerationQueueView from './admin/ModerationQueueView';
import FinancialsView from './admin/FinancialsView';
import GiftManagementView from './admin/GiftManagementView';
import CorbeilView from './admin/CorbeilView';
import VerificationView from './admin/VerificationView';
import AdminSettingsView from './admin/AdminSettingsView';
import CreatorApplicationsView from './admin/CreatorApplicationsView';
import AdManagementView from './admin/AdManagementView';
import BadgeManagementView from './admin/BadgeManagementView';
import TaskManagementView from './admin/TaskManagementView';

interface AdminPanelProps {
  user: User;
  onExit: () => void;
  onSendSystemMessage: (userId: string, message: string) => void;
  showSuccessToast: (message: string) => void;
  monetizationSettings: MonetizationSettings;
  setMonetizationSettings: React.Dispatch<React.SetStateAction<MonetizationSettings>>;
  creatorApplications: CreatorApplication[];
  onCreatorApplicationDecision: (applicationId: string, status: 'approved' | 'rejected') => void;
  onLogout: () => void;
  coinPacks: CoinPack[];
  setCoinPacks: React.Dispatch<React.SetStateAction<CoinPack[]>>;
  dailyRewardSettings: DailyRewardSettings;
  setDailyRewardSettings: React.Dispatch<React.SetStateAction<DailyRewardSettings>>;
  ads: Ad[];
  setAds: React.Dispatch<React.SetStateAction<Ad[]>>;
  adSettings: AdSettings;
  setAdSettings: React.Dispatch<React.SetStateAction<AdSettings>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  taskSettings: TaskSettings;
  setTaskSettings: React.Dispatch<React.SetStateAction<TaskSettings>>;
  siteName: string;
  setSiteName: React.Dispatch<React.SetStateAction<string>>;
}

type AdminView = 'dashboard' | 'users' | 'content' | 'moderation' | 'financials' | 'gifts' | 'verification' | 'corbeil' | 'settings' | 'creatorApps' | 'ads' | 'badges' | 'tasks';

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    user, onExit, onSendSystemMessage, showSuccessToast, monetizationSettings, setMonetizationSettings,
    creatorApplications, onCreatorApplicationDecision, onLogout, coinPacks, setCoinPacks,
    dailyRewardSettings, setDailyRewardSettings, ads, setAds, adSettings, setAdSettings,
    tasks, setTasks, taskSettings, setTaskSettings, siteName, setSiteName
}) => {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  // Lifted state for user search to enable cross-component filtering
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Sidebar Layout State
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>(() => {
    return (localStorage.getItem('sidebarPosition') as 'left' | 'right') || 'left';
  });
  const [sidebarLayout, setSidebarLayout] = useState<'responsive' | 'swappable'>(() => {
    return (localStorage.getItem('sidebarLayout') as 'responsive' | 'swappable') || 'responsive';
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // This would be state from a global store/API in a real app
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [payouts, setPayouts] = useState<PayoutRequest[]>(mockPayoutRequests);
  const [gifts, setGifts] = useState<Gift[]>(mockGifts);
  const [badges, setBadges] = useState<Badge[]>(mockBadges);
  const [deletedUsers, setDeletedUsers] = useState<User[]>([]);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [userForVerification, setUserForVerification] = useState<User | null>(null);

  const [notificationTemplates, setNotificationTemplates] = useState({
    accountSuspended: "Your account has been temporarily suspended due to community guideline violations. Please review our policies.",
    accountBanned: "Your account has been permanently banned due to repeated or severe community guideline violations.",
    accountVerified: "Congratulations {username}! Your account has been successfully verified.",
    accountRestored: "Welcome back, {username}! Your account has been restored and is now active.",
    payoutRejected: "Your recent payout request for ${amount} has been rejected. Please contact support for more details."
  });

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  useEffect(() => {
    localStorage.setItem('sidebarPosition', sidebarPosition);
  }, [sidebarPosition]);

  useEffect(() => {
    localStorage.setItem('sidebarLayout', sidebarLayout);
  }, [sidebarLayout]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setIsProfileMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSetSidebarPosition = (position: 'left' | 'right') => {
    if (sidebarLayout === 'swappable') {
        setIsAnimating(true);
        setTimeout(() => {
            setSidebarPosition(position);
            setIsAnimating(false);
        }, 150); // Match fade-out duration
    } else {
        setSidebarPosition(position);
    }
  };
  
  const handleNavigate = (view: AdminView) => {
      // Clear user search term if navigating away from the user management view
      if (activeView === 'users' && view !== 'users') {
          setUserSearchTerm('');
      }
      setActiveView(view);
  };
  
  const handleViewUser = (userToView: User) => {
      setUserSearchTerm(userToView.username);
      setActiveView('users');
  };

  const handleUpdateTemplate = (templateName: keyof typeof notificationTemplates, newText: string) => {
      setNotificationTemplates(prev => ({ ...prev, [templateName]: newText }));
  };

  const formatSystemMessage = (template: string, user: User, details: { [key: string]: any } = {}) => {
    let message = template.replace('{username}', `@${user.username}`);
    Object.keys(details).forEach(key => {
        message = message.replace(`{${key}}`, details[key]);
    });
    return message;
  };
  
  // User Management Handlers
  const handleUpdateUserStatus = (userId: string, status: User['status']) => {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;
      
      setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
      
      let message = '';
      if (status === 'suspended') {
          message = formatSystemMessage(notificationTemplates.accountSuspended, userToUpdate);
      } else if (status === 'banned') {
           message = formatSystemMessage(notificationTemplates.accountBanned, userToUpdate);
      } else if (status === 'active') {
          message = formatSystemMessage(notificationTemplates.accountRestored, userToUpdate);
      }
      
      if (message) onSendSystemMessage(userId, message);
      showSuccessToast(`User status updated to '${status}'.`);
  };
  
  const handleUpdateUserRole = (userId: string, role: User['role']) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
    showSuccessToast(`@${userToUpdate.username}'s role updated to '${role}'.`);
  };

  const handleBulkUpdateUserStatus = (ids: string[], status: User['status']) => {
      setUsers(users.map(u => ids.includes(u.id) ? { ...u, status } : u));
      
      ids.forEach(id => {
          const userToUpdate = users.find(u => u.id === id);
          if (!userToUpdate) return;
          let message = '';
          if (status === 'suspended') message = formatSystemMessage(notificationTemplates.accountSuspended, userToUpdate);
          else if (status === 'banned') message = formatSystemMessage(notificationTemplates.accountBanned, userToUpdate);
          else if (status === 'active') message = formatSystemMessage(notificationTemplates.accountRestored, userToUpdate);
          if (message) onSendSystemMessage(id, message);
      });

      showSuccessToast(`${ids.length} users updated to '${status}'.`);
      setSelectedUserIds([]);
  };
  
  const handleUpdateUserVerification = (userId: string, isVerified: boolean) => {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      setUsers(users.map(u => u.id === userId ? { ...u, isVerified } : u));
      const statusText = isVerified ? 'verified' : 'un-verified';
      if (isVerified) {
          onSendSystemMessage(userId, formatSystemMessage(notificationTemplates.accountVerified, userToUpdate));
      }
      showSuccessToast(`User status updated to ${statusText}.`);
  };

  const handleUpdateUserBadges = (userId: string, updatedBadges: Badge[]) => {
    setUsers(users.map(u => u.id === userId ? { ...u, badges: updatedBadges } : u));
    showSuccessToast(`Badges updated for user.`);
  };

  const handleUpdatePayoutStatus = (payoutId: string, status: 'approved' | 'rejected') => {
      const payoutToUpdate = payouts.find(p => p.id === payoutId);
      if (!payoutToUpdate) return;
      
      setPayouts(payouts.map(p => p.id === payoutId ? { ...p, status, processedDate: new Date().toISOString().split('T')[0] } : p));
      
      if (status === 'rejected') {
          const userToRefund = users.find(u => u.id === payoutToUpdate.user.id);
          if (userToRefund) {
              const updatedUser = {
                  ...userToRefund,
                  creatorStats: {
                      ...(userToRefund.creatorStats!),
                      totalEarnings: (userToRefund.creatorStats?.totalEarnings ?? 0) + payoutToUpdate.amount,
                  }
              };
              setUsers(users.map(u => u.id === userToRefund.id ? updatedUser : u));
              onSendSystemMessage(payoutToUpdate.user.id, formatSystemMessage(notificationTemplates.payoutRejected, payoutToUpdate.user, { amount: payoutToUpdate.amount.toFixed(2) }));
          }
      }
      showSuccessToast(`Payout ${payoutId} has been ${status}.`);
  };

  const handleAddUser = (newUser: User) => {
    setUsers([newUser, ...users]);
    showSuccessToast(`User @${newUser.username} created.`);
  };

  const handleDeleteUser = (userId: string) => {
      const userToDelete = users.find(u => u.id === userId);
      if (userToDelete) {
          const deletedUser = { ...userToDelete, status: 'deleted' as const, deletionDate: new Date().toISOString() };
          setDeletedUsers(prev => [deletedUser, ...prev]);
          setUsers(users.filter(u => u.id !== userId));
          showSuccessToast(`User @${userToDelete.username} moved to corbeil.`);
      }
  };
  
  const handleBulkDeleteUsers = (ids: string[]) => {
      const usersToDelete = users.filter(u => ids.includes(u.id));
      const deletedToAdd = usersToDelete.map(u => ({ ...u, status: 'deleted' as const, deletionDate: new Date().toISOString() }));
      setDeletedUsers(prev => [...deletedToAdd, ...prev]);
      setUsers(users.filter(u => !ids.includes(u.id)));
      showSuccessToast(`${ids.length} users moved to corbeil.`);
      setSelectedUserIds([]);
  };

   const handleBulkSendMessage = (userIds: string[], message: string) => {
      userIds.forEach(id => onSendSystemMessage(id, message));
      showSuccessToast(`Message sent to ${userIds.length} users.`);
      setSelectedUserIds([]);
  };

  const handleRestoreUser = (userId: string) => {
      const userToRestore = deletedUsers.find(u => u.id === userId);
      if (userToRestore) {
          const restoredUser = { ...userToRestore, status: 'active' as const, deletionDate: undefined };
          setUsers(prev => [restoredUser, ...prev]);
          setDeletedUsers(deletedUsers.filter(u => u.id !== userId));
          showSuccessToast(`User @${userToRestore.username} restored.`);
      }
  };

  const handlePermanentlyDeleteUser = (userId: string) => {
      setDeletedUsers(deletedUsers.filter(u => u.id !== userId));
      showSuccessToast(`User permanently deleted.`);
  };

  // Video Management Handlers
  const handleUpdateVideoStatus = (videoId: string, status: Video['status']) => {
      setVideos(videos.map(v => v.id === videoId ? { ...v, status } : v));
      showSuccessToast(`Video status updated to '${status}'.`);
  };
  const handleDeleteVideo = (videoId: string) => {
      setVideos(videos.filter(v => v.id !== videoId));
      showSuccessToast(`Video permanently deleted.`);
  };
   const handleBulkUpdateVideoStatus = (ids: string[], status: Video['status']) => {
      setVideos(videos.map(v => ids.includes(v.id) ? { ...v, status } : v));
      showSuccessToast(`${ids.length} videos updated to '${status}'.`);
      setSelectedVideoIds([]);
  };
  const handleBulkDeleteVideos = (ids: string[]) => {
      setVideos(videos.filter(v => !ids.includes(v.id)));
      showSuccessToast(`${ids.length} videos permanently deleted.`);
      setSelectedVideoIds([]);
  };

  // Moderation Handlers
    const handleResolveReport = (report: Report) => {
        setReports(reports.map(r => r.id === report.id ? { ...r, status: 'resolved' } : r));
        // Take action on the content
        if (report.contentType === 'video') {
            handleUpdateVideoStatus(report.contentId, 'removed');
        } else if (report.contentType === 'user') {
            handleUpdateUserStatus(report.contentId, 'suspended');
        }
        showSuccessToast(`Report ${report.id} resolved.`);
    };
  const handleDismissReport = (reportId: string) => {
      setReports(reports.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r));
      showSuccessToast(`Report ${reportId} dismissed.`);
  };
  const handleBulkResolveReports = (ids: string[]) => {
        ids.forEach(id => {
            const report = reports.find(r => r.id === id);
            if(report) handleResolveReport(report);
        });
        showSuccessToast(`${ids.length} reports resolved.`);
        setSelectedReportIds([]);
  };
  const handleBulkDismissReports = (ids: string[]) => {
        setReports(reports.map(r => ids.includes(r.id) ? { ...r, status: 'dismissed' } : r));
        showSuccessToast(`${ids.length} reports dismissed.`);
        setSelectedReportIds([]);
  };

  // Gift Handlers
  const handleAddGift = (gift: Gift) => {
    setGifts([gift, ...gifts]);
    showSuccessToast(`Gift '${gift.name}' added.`);
  };
  const handleUpdateGift = (updatedGift: Gift) => {
    setGifts(gifts.map(g => g.id === updatedGift.id ? updatedGift : g));
    showSuccessToast(`Gift '${updatedGift.name}' updated.`);
  };
  const handleDeleteGift = (giftId: string) => {
    setGifts(gifts.filter(g => g.id !== giftId));
    showSuccessToast(`Gift deleted.`);
  };

  const renderView = () => {
    if (userForVerification) {
        return <VerificationView user={userForVerification} onUpdateUser={()=>{}} onBack={() => setUserForVerification(null)} />
    }
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'users': return <UserManagementView 
                                users={users}
                                onAddUser={handleAddUser}
                                onStartVerification={setUserForVerification}
                                onUpdateUserVerification={handleUpdateUserVerification}
                                onUpdateUserStatus={handleUpdateUserStatus}
                                onUpdateUserRole={handleUpdateUserRole}
                                onDeleteUser={handleDeleteUser}
                                selectedUserIds={selectedUserIds}
                                onSetSelectedUserIds={setSelectedUserIds}
                                onBulkUpdateStatus={handleBulkUpdateUserStatus}
                                onBulkDelete={handleBulkDeleteUsers}
                                onSendSystemMessage={onSendSystemMessage}
                                onBulkSendMessage={handleBulkSendMessage}
                                searchTerm={userSearchTerm}
                                onSearchTermChange={setUserSearchTerm}
                                availableBadges={badges}
                                onUpdateUserBadges={handleUpdateUserBadges}
                             />;
      case 'content': return <ContentManagementView 
                                videos={videos}
                                onUpdateVideoStatus={handleUpdateVideoStatus}
                                onDeleteVideo={handleDeleteVideo}
                                selectedVideoIds={selectedVideoIds}
                                onSetSelectedVideoIds={setSelectedVideoIds}
                                onBulkUpdateStatus={handleBulkUpdateVideoStatus}
                                onBulkDelete={handleBulkDeleteVideos}
                                onViewUser={handleViewUser}
                             />;
      case 'moderation': return <ModerationQueueView 
                                    reports={reports}
                                    users={users}
                                    videos={videos}
                                    onResolveReport={(id) => { const r = reports.find(r=>r.id===id); if(r) handleResolveReport(r); }}
                                    onDismissReport={handleDismissReport}
                                    selectedReportIds={selectedReportIds}
                                    onSetSelectedReportIds={setSelectedReportIds}
                                    onBulkResolve={handleBulkResolveReports}
                                    onBulkDismiss={handleBulkDismissReports}
                                />;
      case 'creatorApps': return <CreatorApplicationsView applications={creatorApplications} onDecision={onCreatorApplicationDecision} />;
      case 'financials': return <FinancialsView payouts={payouts} users={users} onUpdatePayoutStatus={handleUpdatePayoutStatus} />;
      case 'gifts': return <GiftManagementView gifts={gifts} onAddGift={handleAddGift} onUpdateGift={handleUpdateGift} onDeleteGift={handleDeleteGift} />;
      case 'badges': return <BadgeManagementView badges={badges} setBadges={setBadges} showSuccessToast={showSuccessToast} />;
      case 'ads': return <AdManagementView ads={ads} setAds={setAds} showSuccessToast={showSuccessToast} />;
      case 'tasks': return <TaskManagementView tasks={tasks} setTasks={setTasks} allAds={ads} showSuccessToast={showSuccessToast} />;
      case 'corbeil': return <CorbeilView 
                                users={deletedUsers}
                                onRestoreUser={handleRestoreUser}
                                onPermanentlyDeleteUser={handlePermanentlyDeleteUser}
                                selectedUserIds={selectedUserIds}
                                onSetSelectedUserIds={setSelectedUserIds}
                                onBulkRestore={(ids) => { ids.forEach(handleRestoreUser); setSelectedUserIds([]); }}
                                onBulkPermanentDelete={(ids) => { ids.forEach(handlePermanentlyDeleteUser); setSelectedUserIds([]); }}
                            />;
      case 'settings': return <AdminSettingsView 
                                sidebarPosition={sidebarPosition}
                                onSetSidebarPosition={handleSetSidebarPosition}
                                sidebarLayout={sidebarLayout}
                                onSetSidebarLayout={setSidebarLayout}
                                notificationTemplates={notificationTemplates}
                                onUpdateTemplate={handleUpdateTemplate}
                                monetizationSettings={monetizationSettings}
                                onSetMonetizationSettings={setMonetizationSettings}
                                showSuccessToast={showSuccessToast}
                                coinPacks={coinPacks}
                                setCoinPacks={setCoinPacks}
                                dailyRewardSettings={dailyRewardSettings}
                                onSetDailyRewardSettings={setDailyRewardSettings}
                                adSettings={adSettings}
                                onSetAdSettings={setAdSettings}
                                taskSettings={taskSettings}
                                onSetTaskSettings={setTaskSettings}
                                siteName={siteName}
                                onSetSiteName={setSiteName}
                              />;
      default: return null;
    }
  };

  const NavItem: React.FC<{ view: AdminView; icon: React.ReactNode; label: string }> = ({ view, icon, label }) => (
    <button
      onClick={() => handleNavigate(view)}
      title={label}
      className={`flex items-center justify-center lg:justify-start w-full p-3 my-1 rounded-lg transition-colors text-sm ${
        activeView === view ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-zinc-700'
      }`}
    >
      {icon}
      <span className={`ml-3 ${sidebarLayout === 'responsive' ? 'hidden lg:inline' : ''}`}>{label}</span>
    </button>
  );

  const animationClass = isAnimating ? 'animate-fade-out-fast' : 'animate-fade-in-fast';

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-white dark ${sidebarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
      {/* Sidebar */}
      <aside className={`bg-gray-800 dark:bg-black text-white flex flex-col transition-all duration-300 ${sidebarLayout === 'responsive' ? 'w-20 lg:w-64' : 'w-64'} shrink-0 ${animationClass}`}>
        <div className="flex items-center justify-center h-16 border-b border-zinc-800 shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-red-500 text-transparent bg-clip-text">
            <span className={`${sidebarLayout === 'responsive' ? 'hidden lg:inline' : ''}`}>ADMIN</span>
            <span className={`${sidebarLayout === 'responsive' ? 'inline lg:hidden' : 'hidden'}`}>A</span>
          </h1>
        </div>
        <nav className="flex-1 p-2 lg:p-4 overflow-y-auto">
          <NavItem view="dashboard" icon={<DashboardIcon />} label="Dashboard" />
          <NavItem view="users" icon={<UsersIcon />} label="Users" />
          <NavItem view="content" icon={<VideoIcon />} label="Content" />
          <NavItem view="moderation" icon={<ShieldCheckIcon />} label="Moderation" />
          <NavItem view="creatorApps" icon={<StarIcon />} label="Creator Apps" />
          <NavItem view="financials" icon={<DollarSignIcon />} label="Financials" />
          <NavItem view="gifts" icon={<GiftIcon />} label="Gifts" />
          <NavItem view="badges" icon={<BadgeIcon />} label="Badges" />
          <NavItem view="ads" icon={<MegaphoneIcon />} label="Ads" />
          <NavItem view="tasks" icon={<TasksIcon />} label="Tasks" />
          <NavItem view="corbeil" icon={<RestoreIcon />} label="Corbeil" />
        </nav>
        <div className="p-2 lg:p-4 border-t border-zinc-800 shrink-0">
          <NavItem view="settings" icon={<SettingsIcon />} label="Settings" />
          <button
            onClick={onExit}
            title="Exit Admin Panel"
            className="flex items-center justify-center lg:justify-start w-full p-3 my-1 rounded-lg transition-colors text-sm text-gray-300 hover:bg-zinc-700"
          >
            <LogOutIcon />
            <span className={`ml-3 ${sidebarLayout === 'responsive' ? 'hidden lg:inline' : ''}`}>Exit</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${animationClass}`}>
        <header className="flex justify-between items-center p-4 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 shrink-0">
          <div/>
          <div className="flex items-center gap-4">
            <div className="relative" ref={profileMenuRef}>
              <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="flex items-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 rounded-full p-0.5">
                <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full" />
                <span className="ml-2 font-semibold text-sm hidden sm:block">@{user.username}</span>
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg z-20 border dark:border-zinc-700 py-1 animate-fade-in-up">
                  <button onClick={() => { onExit(); setIsProfileMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
                      <ProfileIcon className="w-4 h-4 mr-3" /> View Profile
                  </button>
                  <div className="border-t border-gray-100 dark:border-zinc-700 my-1"></div>
                  <button onClick={() => { onLogout(); setIsProfileMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
                      <LogOutIcon className="w-4 h-4 mr-3" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;