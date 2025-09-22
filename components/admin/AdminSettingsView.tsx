import React, { useState } from 'react';
import { MonetizationSettings, PaymentProvider, CoinPack, DailyRewardSettings, AdSettings, AdMobSettings, TaskSettings } from '../../types';
import { TrashIcon, PlusCircleIcon, PencilIcon, CheckCircleIcon } from '../icons/Icons';

interface NotificationTemplates {
    accountSuspended: string;
    accountBanned: string;
    accountVerified: string;
    accountRestored: string;
    payoutRejected: string;
}

interface AdminSettingsViewProps {
    sidebarPosition: 'left' | 'right';
    onSetSidebarPosition: (position: 'left' | 'right') => void;
    sidebarLayout: 'responsive' | 'swappable';
    onSetSidebarLayout: (layout: 'responsive' | 'swappable') => void;
    notificationTemplates: NotificationTemplates;
    onUpdateTemplate: (templateName: keyof NotificationTemplates, newText: string) => void;
    monetizationSettings: MonetizationSettings;
    onSetMonetizationSettings: React.Dispatch<React.SetStateAction<MonetizationSettings>>;
    showSuccessToast: (message: string) => void;
    coinPacks: CoinPack[];
    setCoinPacks: React.Dispatch<React.SetStateAction<CoinPack[]>>;
    dailyRewardSettings: DailyRewardSettings;
    onSetDailyRewardSettings: React.Dispatch<React.SetStateAction<DailyRewardSettings>>;
    adSettings: AdSettings;
    onSetAdSettings: React.Dispatch<React.SetStateAction<AdSettings>>;
    taskSettings: TaskSettings;
    onSetTaskSettings: React.Dispatch<React.SetStateAction<TaskSettings>>;
    siteName: string;
    onSetSiteName: React.Dispatch<React.SetStateAction<string>>;
}


const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
        <div className="p-6">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-b-lg">
            {children}
        </div>
    </div>
);

const TemplateEditor: React.FC<{
    title: string;
    templateKey: keyof NotificationTemplates;
    templates: NotificationTemplates;
    onUpdateTemplate: (templateName: keyof NotificationTemplates, newText: string) => void;
    placeholders: string[];
    showSuccessToast: (message: string) => void;
}> = ({ title, templateKey, templates, onUpdateTemplate, placeholders, showSuccessToast }) => {
    const [text, setText] = React.useState(templates[templateKey]);

    const handleSave = () => {
        onUpdateTemplate(templateKey, text);
        showSuccessToast(`'${title}' template saved!`);
    };

    return (
        <div>
            <label className="text-sm font-medium">{title}</label>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="mt-1 w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md text-sm"
            />
            <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Placeholders: {placeholders.join(', ')}
                </p>
                <button
                    onClick={handleSave}
                    className="px-3 py-1 text-xs font-semibold bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

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

const CoinPackEditor: React.FC<{
    packs: CoinPack[];
    setPacks: React.Dispatch<React.SetStateAction<CoinPack[]>>;
}> = ({ packs, setPacks }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [tempPack, setTempPack] = useState<CoinPack | null>(null);

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setTempPack(packs[index]);
    };

    const handleSave = (index: number) => {
        if (tempPack) {
            const newPacks = [...packs];
            newPacks[index] = tempPack;
            setPacks(newPacks);
        }
        setEditingIndex(null);
        setTempPack(null);
    };
    
    const handleAdd = () => {
        const newPack: CoinPack = { amount: 0, price: 0, description: 'New Pack', isPopular: false };
        setPacks([...packs, newPack]);
        setEditingIndex(packs.length);
        setTempPack(newPack);
    };

    const handleDelete = (index: number) => {
        if (window.confirm('Are you sure you want to delete this coin pack?')) {
            setPacks(packs.filter((_, i) => i !== index));
        }
    };
    
    const handleInputChange = (field: keyof CoinPack, value: string | number | boolean) => {
        if (tempPack) {
            setTempPack({ ...tempPack, [field]: value });
        }
    };

    return (
        <div className="space-y-3">
            {packs.map((pack, index) => (
                <div key={index} className="bg-gray-200 dark:bg-zinc-700/50 p-3 rounded-md">
                    {editingIndex === index ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
                            <input type="number" placeholder="Amount" value={tempPack?.amount} onChange={e => handleInputChange('amount', parseInt(e.target.value) || 0)} className="w-full text-sm p-1 bg-gray-50 dark:bg-zinc-800 rounded-md"/>
                            <input type="number" step="0.01" placeholder="Price" value={tempPack?.price} onChange={e => handleInputChange('price', parseFloat(e.target.value) || 0)} className="w-full text-sm p-1 bg-gray-50 dark:bg-zinc-800 rounded-md"/>
                            <input type="text" placeholder="Description" value={tempPack?.description} onChange={e => handleInputChange('description', e.target.value)} className="w-full text-sm p-1 bg-gray-50 dark:bg-zinc-800 rounded-md"/>
                            <div className="flex items-center justify-end gap-2">
                                <label className="flex items-center text-xs"><input type="checkbox" checked={tempPack?.isPopular} onChange={e => handleInputChange('isPopular', e.target.checked)} className="mr-1 h-3 w-3 rounded-sm"/>Popular</label>
                                <button onClick={() => handleSave(index)} className="p-1.5 text-green-500"><CheckCircleIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center text-sm">
                            <p><strong>Amount:</strong> {pack.amount.toLocaleString()}</p>
                            <p><strong>Price:</strong> ${pack.price.toFixed(2)}</p>
                            <p><strong>Desc:</strong> {pack.description} {pack.isPopular && '⭐'}</p>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => handleEdit(index)} className="p-1.5 text-blue-500"><PencilIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(index)} className="p-1.5 text-red-500"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
            <button onClick={handleAdd} className="flex items-center gap-2 text-sm font-semibold text-pink-500 dark:text-pink-400 hover:underline">
                <PlusCircleIcon /> Add Coin Pack
            </button>
        </div>
    );
};


const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ 
    sidebarPosition, onSetSidebarPosition,
    sidebarLayout, onSetSidebarLayout,
    notificationTemplates, onUpdateTemplate,
    monetizationSettings, onSetMonetizationSettings,
    showSuccessToast,
    coinPacks, setCoinPacks,
    dailyRewardSettings, onSetDailyRewardSettings,
    adSettings, onSetAdSettings,
    taskSettings, onSetTaskSettings,
    siteName, onSetSiteName
 }) => {

    const [localSiteName, setLocalSiteName] = useState(siteName);
    const [localMonetizationSettings, setLocalMonetizationSettings] = useState(monetizationSettings);
    const [localDailyRewardSettings, setLocalDailyRewardSettings] = useState(dailyRewardSettings);
    const [localAdSettings, setLocalAdSettings] = useState(adSettings);
    const [localTaskSettings, setLocalTaskSettings] = useState(taskSettings);
    const [newPaymentProviderName, setNewPaymentProviderName] = useState('');

    const handleSaveGeneralSettings = () => {
        onSetSiteName(localSiteName);
        showSuccessToast('General settings saved!');
    };

    const handleMonetizationChange = (field: keyof Omit<MonetizationSettings, 'paymentProviders' | 'creatorCriteria'>, value: string | number) => {
        setLocalMonetizationSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleCriteriaChange = (field: keyof MonetizationSettings['creatorCriteria'], value: number) => {
        setLocalMonetizationSettings(prev => ({
            ...prev,
            creatorCriteria: {
                ...prev.creatorCriteria,
                [field]: value,
            }
        }));
    };

    const handleTogglePaymentProvider = (id: string) => {
        setLocalMonetizationSettings(prev => ({
            ...prev,
            paymentProviders: prev.paymentProviders.map(method =>
                method.id === id ? { ...method, isEnabled: !method.isEnabled } : method
            ),
        }));
    };
    
    const handleAddPaymentProvider = () => {
        if (!newPaymentProviderName.trim()) return;
        const newMethod: PaymentProvider = {
            id: newPaymentProviderName.trim().toLowerCase().replace(/\s+/g, '-'),
            name: newPaymentProviderName.trim(),
            isEnabled: true,
        };
        if (localMonetizationSettings.paymentProviders.some(m => m.id === newMethod.id || m.name.toLowerCase() === newMethod.name.toLowerCase())) {
            alert('A payment provider with this name already exists.');
            return;
        }
        setLocalMonetizationSettings(prev => ({
            ...prev,
            paymentProviders: [...prev.paymentProviders, newMethod]
        }));
        setNewPaymentProviderName('');
    };

    const handleRemovePaymentProvider = (id: string) => {
         setLocalMonetizationSettings(prev => ({
            ...prev,
            paymentProviders: prev.paymentProviders.filter(method => method.id !== id),
        }));
    };

    const handleSaveMonetization = () => {
        onSetMonetizationSettings(localMonetizationSettings);
        showSuccessToast('Monetization settings saved!');
    };

    const handleDailyRewardChange = (field: keyof Omit<DailyRewardSettings, 'rewards'>, value: string | boolean) => {
        setLocalDailyRewardSettings(prev => ({ ...prev, [field]: value }));
    };
    
    const handleRewardTierChange = (index: number, amount: number) => {
        setLocalDailyRewardSettings(prev => {
            const newRewards = [...prev.rewards];
            newRewards[index] = { amount };
            return { ...prev, rewards: newRewards };
        });
    };
    
    const handleAddRewardTier = () => {
        setLocalDailyRewardSettings(prev => ({
            ...prev,
            rewards: [...prev.rewards, { amount: 0 }]
        }));
    };
    
    const handleRemoveRewardTier = (index: number) => {
        setLocalDailyRewardSettings(prev => ({
            ...prev,
            rewards: prev.rewards.filter((_, i) => i !== index)
        }));
    };
    
    const handleSaveDailyRewards = () => {
        onSetDailyRewardSettings(localDailyRewardSettings);
        showSuccessToast('Daily Reward settings saved!');
    };
    
    const handleAdSettingsChange = (field: keyof AdSettings, value: string | number | boolean) => {
        setLocalAdSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleAdMobSettingsChange = (field: keyof AdMobSettings, value: string | boolean) => {
        setLocalAdSettings(prev => ({
            ...prev,
            adMob: {
                isEnabled: prev.adMob?.isEnabled ?? false,
                appId: prev.adMob?.appId ?? '',
                bannerAdUnitId: prev.adMob?.bannerAdUnitId ?? '',
                interstitialAdUnitId: prev.adMob?.interstitialAdUnitId ?? '',
                rewardedAdUnitId: prev.adMob?.rewardedAdUnitId ?? '',
                ...prev.adMob,
                [field]: value,
            }
        }));
    };

    const handleSaveAdSettings = () => {
        onSetAdSettings(localAdSettings);
        showSuccessToast('Advertisement settings saved!');
    };

    const handleSaveTaskSettings = () => {
        onSetTaskSettings(localTaskSettings);
        showSuccessToast('Task System settings saved!');
    };


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">System Settings</h1>
            
            <SettingsCard
                title="General Settings"
                description="Manage the site's name and branding."
            >
                <div className="space-y-4">
                    <div>
                        <label htmlFor="siteName" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Site Name</label>
                        <input
                            id="siteName"
                            type="text"
                            value={localSiteName}
                            onChange={(e) => setLocalSiteName(e.target.value)}
                            className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"
                        />
                    </div>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSaveGeneralSettings}
                        className="px-4 py-2 text-sm font-semibold bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                    >
                        Save General Settings
                    </button>
                </div>
            </SettingsCard>
            
            <SettingsCard
                title="Interface Preferences"
                description="Customize the look and feel of the admin panel."
            >
                <div className="space-y-4">
                     <div>
                        <p className="font-medium mb-2">Sidebar Position</p>
                         <div className="flex items-center p-1 bg-gray-200 dark:bg-zinc-700 rounded-full w-min">
                            <button onClick={() => onSetSidebarPosition('left')} className={`px-4 py-1.5 text-sm rounded-full ${sidebarPosition === 'left' ? 'bg-white dark:bg-zinc-900 shadow' : ''}`}>Left</button>
                            <button onClick={() => onSetSidebarPosition('right')} className={`px-4 py-1.5 text-sm rounded-full ${sidebarPosition === 'right' ? 'bg-white dark:bg-zinc-900 shadow' : ''}`}>Right</button>
                        </div>
                    </div>
                    <div>
                        <p className="font-medium mb-2">Sidebar Layout Style</p>
                         <div className="flex items-center p-1 bg-gray-200 dark:bg-zinc-700 rounded-full w-min">
                            <button onClick={() => onSetSidebarLayout('responsive')} className={`px-4 py-1.5 text-sm rounded-full ${sidebarLayout === 'responsive' ? 'bg-white dark:bg-zinc-900 shadow' : ''}`}>Responsive</button>
                            <button onClick={() => onSetSidebarLayout('swappable')} className={`px-4 py-1.5 text-sm rounded-full ${sidebarLayout === 'swappable' ? 'bg-white dark:bg-zinc-900 shadow' : ''}`}>Swappable</button>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard
                title="Task System"
                description="Manage the user task and reward system."
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label htmlFor="enableTasks" className="font-medium">Enable Task System</label>
                        <ToggleSwitch
                            isEnabled={localTaskSettings.isEnabled}
                            onToggle={() => setLocalTaskSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                        />
                    </div>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSaveTaskSettings}
                        className="px-4 py-2 text-sm font-semibold bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                    >
                        Save Task Settings
                    </button>
                </div>
            </SettingsCard>
            
            <SettingsCard
                title="Advertisement System"
                description="Manage how ads are displayed across the application."
            >
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="enableAds" className="font-medium">Enable Internal Ad System</label>
                            <ToggleSwitch
                                isEnabled={localAdSettings.isEnabled}
                                onToggle={() => handleAdSettingsChange('isEnabled', !localAdSettings.isEnabled)}
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="interstitialFrequency" className="block text-sm font-medium mb-1">Internal Interstitial Ad Frequency</label>
                            <input
                                id="interstitialFrequency" type="number"
                                value={localAdSettings.interstitialFrequency}
                                onChange={(e) => handleAdSettingsChange('interstitialFrequency', parseInt(e.target.value) || 0)}
                                className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"
                            />
                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Show an internal full-screen video ad in the main feed every N videos.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                            <label htmlFor="enableSkippable" className="font-medium">Enable Skippable Interstitial Ads</label>
                            <ToggleSwitch
                                isEnabled={localAdSettings.isSkippable}
                                onToggle={() => handleAdSettingsChange('isSkippable', !localAdSettings.isSkippable)}
                            />
                        </div>
                        {localAdSettings.isSkippable && (
                            <div className="mt-4 animate-fade-in-up">
                                <label htmlFor="skipDelay" className="block text-sm font-medium mb-1">Skip Ad Delay (seconds)</label>
                                <input
                                    id="skipDelay" type="number"
                                    value={localAdSettings.skipDelaySeconds}
                                    onChange={(e) => handleAdSettingsChange('skipDelaySeconds', parseInt(e.target.value) || 0)}
                                    className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"
                                />
                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    How long a user must watch before the 'Skip' button appears.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                            <label htmlFor="enableAdMob" className="font-medium">Enable AdMob Integration</label>
                            <ToggleSwitch
                                isEnabled={localAdSettings.adMob?.isEnabled ?? false}
                                onToggle={() => handleAdMobSettingsChange('isEnabled', !localAdSettings.adMob?.isEnabled)}
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            When enabled, the app will use AdMob instead of the internal ad system.
                        </p>

                        {localAdSettings.adMob?.isEnabled && (
                            <div className="mt-4 space-y-4 animate-fade-in-up">
                                <div>
                                    <label htmlFor="admobAppId" className="block text-sm font-medium mb-1">AdMob App ID</label>
                                    <input
                                        id="admobAppId" type="text"
                                        value={localAdSettings.adMob?.appId || ''}
                                        onChange={(e) => handleAdMobSettingsChange('appId', e.target.value)}
                                        placeholder="ca-app-pub-..."
                                        className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="admobBannerId" className="block text-sm font-medium mb-1">Banner Ad Unit ID</label>
                                    <input
                                        id="admobBannerId" type="text"
                                        value={localAdSettings.adMob?.bannerAdUnitId || ''}
                                        onChange={(e) => handleAdMobSettingsChange('bannerAdUnitId', e.target.value)}
                                        placeholder="ca-app-pub-..."
                                        className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="admobInterstitialId" className="block text-sm font-medium mb-1">Interstitial Ad Unit ID</label>
                                    <input
                                        id="admobInterstitialId" type="text"
                                        value={localAdSettings.adMob?.interstitialAdUnitId || ''}
                                        onChange={(e) => handleAdMobSettingsChange('interstitialAdUnitId', e.target.value)}
                                        placeholder="ca-app-pub-..."
                                        className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="admobRewardedId" className="block text-sm font-medium mb-1">Rewarded Ad Unit ID</label>
                                    <input
                                        id="admobRewardedId" type="text"
                                        value={localAdSettings.adMob?.rewardedAdUnitId || ''}
                                        onChange={(e) => handleAdMobSettingsChange('rewardedAdUnitId', e.target.value)}
                                        placeholder="ca-app-pub-..."
                                        className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSaveAdSettings}
                        className="px-4 py-2 text-sm font-semibold bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                    >
                        Save Ad Settings
                    </button>
                </div>
            </SettingsCard>

            <SettingsCard
                title="Daily Reward System"
                description="Configure the daily check-in rewards and streak bonuses for users."
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label htmlFor="enableRewards" className="font-medium">Enable Daily Rewards</label>
                        <ToggleSwitch
                            isEnabled={localDailyRewardSettings.isEnabled}
                            onToggle={() => handleDailyRewardChange('isEnabled', !localDailyRewardSettings.isEnabled)}
                        />
                    </div>
                    <div>
                        <label htmlFor="modalTitle" className="block text-sm font-medium mb-1">Modal Title</label>
                        <input
                            id="modalTitle" type="text"
                            value={localDailyRewardSettings.modalTitle}
                            onChange={(e) => handleDailyRewardChange('modalTitle', e.target.value)}
                            className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="modalSubtitle" className="block text-sm font-medium mb-1">Modal Subtitle</label>
                        <input
                            id="modalSubtitle" type="text"
                            value={localDailyRewardSettings.modalSubtitle}
                            onChange={(e) => handleDailyRewardChange('modalSubtitle', e.target.value)}
                            className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"
                        />
                    </div>

                    <div>
                        <p className="font-medium mb-2">Reward Tiers (by streak day)</p>
                        <div className="space-y-2">
                            {localDailyRewardSettings.rewards.map((tier, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 bg-gray-200 dark:bg-zinc-700/50 rounded-md">
                                    <span className="font-semibold text-sm">Day {index + 1}</span>
                                    <input
                                        type="number"
                                        value={tier.amount}
                                        onChange={(e) => handleRewardTierChange(index, parseInt(e.target.value) || 0)}
                                        className="w-full p-1 bg-gray-50 dark:bg-zinc-800 rounded-md text-sm"
                                    />
                                    <button onClick={() => handleRemoveRewardTier(index)} className="text-red-500 hover:text-red-400" aria-label={`Remove Day ${index + 1}`}>
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddRewardTier} className="flex items-center gap-2 text-sm font-semibold text-pink-500 dark:text-pink-400 hover:underline mt-3">
                            <PlusCircleIcon /> Add Day
                        </button>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSaveDailyRewards}
                        className="px-4 py-2 text-sm font-semibold bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                    >
                        Save Daily Reward Settings
                    </button>
                </div>
            </SettingsCard>
            
            <SettingsCard
                title="Monetization Settings"
                description="Configure currency, fees, and payment options for the platform."
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="currencySymbol" className="block text-sm font-medium mb-1">Currency Symbol</label>
                            <input
                                id="currencySymbol"
                                type="text"
                                value={localMonetizationSettings.currencySymbol}
                                onChange={(e) => handleMonetizationChange('currencySymbol', e.target.value)}
                                className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="processingFee" className="block text-sm font-medium mb-1">Processing Fee (%)</label>
                            <input
                                id="processingFee"
                                type="number"
                                value={localMonetizationSettings.processingFeePercent}
                                onChange={(e) => handleMonetizationChange('processingFeePercent', parseFloat(e.target.value) || 0)}
                                className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="minPayout" className="block text-sm font-medium mb-1">Minimum Payout</label>
                            <input
                                id="minPayout"
                                type="number"
                                value={localMonetizationSettings.minPayoutAmount}
                                onChange={(e) => handleMonetizationChange('minPayoutAmount', parseFloat(e.target.value) || 0)}
                                className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"
                            />
                        </div>
                    </div>
                    <div>
                        <p className="font-medium mb-2">Creator Program Criteria</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div>
                                <label htmlFor="minFollowers" className="block text-sm font-medium mb-1">Min Followers</label>
                                <input id="minFollowers" type="number" value={localMonetizationSettings.creatorCriteria.minFollowers} onChange={(e) => handleCriteriaChange('minFollowers', parseInt(e.target.value) || 0)} className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="minViews" className="block text-sm font-medium mb-1">Min Total Views</label>
                                <input id="minViews" type="number" value={localMonetizationSettings.creatorCriteria.minViews} onChange={(e) => handleCriteriaChange('minViews', parseInt(e.target.value) || 0)} className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="minVideos" className="block text-sm font-medium mb-1">Min Videos Uploaded</label>
                                <input id="minVideos" type="number" value={localMonetizationSettings.creatorCriteria.minVideos} onChange={(e) => handleCriteriaChange('minVideos', parseInt(e.target.value) || 0)} className="w-full p-2 bg-gray-200 dark:bg-zinc-700 rounded-md" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="font-medium mb-2">Coin Package Configuration</p>
                        <CoinPackEditor packs={coinPacks} setPacks={setCoinPacks} />
                    </div>
                    <div>
                        <p className="font-medium mb-2">Payment Providers (for Top-ups & Payouts)</p>
                        <div className="space-y-2">
                             {localMonetizationSettings.paymentProviders.map(method => (
                                <div key={method.id} className="flex items-center justify-between p-2 bg-gray-200 dark:bg-zinc-700/50 rounded-md">
                                    <label htmlFor={`${method.id}-toggle`} className="flex-1 font-medium">{method.name}</label>
                                    <div className="flex items-center gap-4">
                                        <ToggleSwitch
                                            isEnabled={method.isEnabled}
                                            onToggle={() => handleTogglePaymentProvider(method.id)}
                                        />
                                        <button onClick={() => handleRemovePaymentProvider(method.id)} className="text-red-500 hover:text-red-400" aria-label={`Remove ${method.name}`}>
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                        <p className="font-medium mb-2">Add New Payment Provider</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="e.g., Payoneer"
                                value={newPaymentProviderName}
                                onChange={(e) => setNewPaymentProviderName(e.target.value)}
                                className="flex-1 p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"
                            />
                            <button
                                onClick={handleAddPaymentProvider}
                                disabled={!newPaymentProviderName.trim()}
                                className="px-4 py-2 text-sm font-semibold bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSaveMonetization}
                        className="px-4 py-2 text-sm font-semibold bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                    >
                        Save Monetization Settings
                    </button>
                </div>
            </SettingsCard>

             <SettingsCard
                title="Notification Templates"
                description="Customize automated messages sent to users for system events."
            >
                <div className="space-y-6">
                    <TemplateEditor 
                        title="Account Suspension" 
                        templateKey="accountSuspended"
                        templates={notificationTemplates}
                        onUpdateTemplate={onUpdateTemplate}
                        placeholders={['{username}']}
                        showSuccessToast={showSuccessToast}
                    />
                     <TemplateEditor 
                        title="Account Ban" 
                        templateKey="accountBanned"
                        templates={notificationTemplates}
                        onUpdateTemplate={onUpdateTemplate}
                        placeholders={['{username}']}
                        showSuccessToast={showSuccessToast}
                    />
                    <TemplateEditor 
                        title="Account Verification" 
                        templateKey="accountVerified"
                        templates={notificationTemplates}
                        onUpdateTemplate={onUpdateTemplate}
                        placeholders={['{username}']}
                        showSuccessToast={showSuccessToast}
                    />
                    <TemplateEditor 
                        title="Account Restoration" 
                        templateKey="accountRestored"
                        templates={notificationTemplates}
                        onUpdateTemplate={onUpdateTemplate}
                        placeholders={['{username}']}
                        showSuccessToast={showSuccessToast}
                    />
                    <TemplateEditor 
                        title="Payout Rejection" 
                        templateKey="payoutRejected"
                        templates={notificationTemplates}
                        onUpdateTemplate={onUpdateTemplate}
                        placeholders={['{username}', '{amount}']}
                        showSuccessToast={showSuccessToast}
                    />
                </div>
            </SettingsCard>

        </div>
    );
};

export default AdminSettingsView;