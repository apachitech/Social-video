
import React, { useState, useEffect } from 'react';
import { Ad } from '../../types';
import { PlusCircleIcon, PencilIcon, TrashIcon, CloseIcon } from '../icons/Icons';

// Modal for Adding/Editing Ads
const AdModal: React.FC<{
    ad?: Ad | null;
    onClose: () => void;
    onSave: (ad: Ad) => void;
}> = ({ ad, onClose, onSave }) => {
    const [name, setName] = useState(ad?.name || '');
    const [type, setType] = useState<Ad['type']>(ad?.type || 'banner');
    const [placement, setPlacement] = useState<Ad['placement']>(ad?.placement || 'feed_video_overlay');
    const [imageUrl, setImageUrl] = useState(ad?.content.imageUrl || '');
    const [videoUrl, setVideoUrl] = useState(ad?.content.videoUrl || '');
    const [linkUrl, setLinkUrl] = useState(ad?.content.linkUrl || '');
    const [ctaText, setCtaText] = useState(ad?.ctaText || 'Learn More');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !placement || !linkUrl || !ctaText) {
            alert('Please fill all required fields.');
            return;
        }
        if (type === 'banner' && !imageUrl) {
            alert('Image URL is required for banner ads.');
            return;
        }
        if (type === 'video' && !videoUrl) {
            alert('Video URL is required for video ads.');
            return;
        }

        const savedAd: Ad = {
            id: ad?.id || `ad-${Date.now()}`,
            name,
            type,
            placement,
            content: {
                imageUrl: type === 'banner' ? imageUrl : undefined,
                videoUrl: type === 'video' ? videoUrl : undefined,
                linkUrl,
            },
            ctaText,
            isActive: ad?.isActive ?? true,
        };
        onSave(savedAd);
    };
    
    // FIX: Corrected the `placementOptions` for banner ads to match the Ad type.
    // Changed 'live_stream_overlay' to 'live_stream_banner' and added 'profile_banner'.
    const placementOptions: Ad['placement'][] = type === 'banner' 
        ? ['feed_video_overlay', 'live_stream_banner', 'profile_banner']
        : ['feed_interstitial'];
        
    useEffect(() => {
        if (!placementOptions.includes(placement)) {
            setPlacement(placementOptions[0]);
        }
    }, [type, placement, placementOptions]);

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-lg text-gray-800 dark:text-white relative animate-fade-in-up border border-gray-200 dark:border-zinc-800">
                <header className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
                    <h2 className="text-xl font-bold">{ad ? 'Edit Ad' : 'Add New Ad'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                        <CloseIcon />
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <div className="sm:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ad Name</label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ad Type</label>
                            <select id="type" value={type} onChange={e => setType(e.target.value as Ad['type'])} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md">
                                <option value="banner">Banner</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="placement" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Placement</label>
                            <select id="placement" value={placement} onChange={e => setPlacement(e.target.value as Ad['placement'])} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md">
                                {placementOptions.map(opt => <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                         {type === 'banner' ? (
                            <div className="sm:col-span-2">
                                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Image URL</label>
                                <input id="imageUrl" type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                            </div>
                        ) : (
                            <div className="sm:col-span-2">
                                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Video URL</label>
                                <input id="videoUrl" type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                            </div>
                        )}
                        <div className="sm:col-span-2">
                            <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Target Link URL (CTA)</label>
                            <input id="linkUrl" type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="ctaText" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">CTA Button Text</label>
                            <input id="ctaText" type="text" value={ctaText} onChange={e => setCtaText(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-md" required />
                        </div>
                    </main>
                    <footer className="flex justify-end gap-3 p-4 border-t dark:border-zinc-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 font-semibold text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-pink-600 hover:bg-pink-700 font-semibold text-white text-sm">Save Ad</button>
                    </footer>
                </form>
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


interface AdManagementViewProps {
    ads: Ad[];
    setAds: React.Dispatch<React.SetStateAction<Ad[]>>;
    showSuccessToast: (message: string) => void;
}

const AdManagementView: React.FC<AdManagementViewProps> = ({ ads, setAds, showSuccessToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [adToDelete, setAdToDelete] = useState<Ad | null>(null);

    const handleSaveAd = (ad: Ad) => {
        if (editingAd) {
            setAds(prevAds => prevAds.map(a => a.id === ad.id ? ad : a));
            showSuccessToast('Ad updated successfully!');
        } else {
            setAds(prevAds => [ad, ...prevAds]);
            showSuccessToast('New ad created!');
        }
        setIsModalOpen(false);
        setEditingAd(null);
    };

    const handleEditClick = (ad: Ad) => {
        setEditingAd(ad);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingAd(null);
        setIsModalOpen(true);
    };
    
    const handleDeleteConfirm = () => {
        if (adToDelete) {
            setAds(prevAds => prevAds.filter(a => a.id !== adToDelete.id));
            showSuccessToast('Ad deleted.');
            setAdToDelete(null);
        }
    };
    
    const handleToggleActive = (adId: string) => {
        setAds(prevAds => prevAds.map(ad => 
            ad.id === adId ? { ...ad, isActive: !ad.isActive } : ad
        ));
    };

    return (
        <>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Ad Management</h2>
                    <button onClick={handleAddClick} className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-pink-700 transition-colors">
                        <PlusCircleIcon />
                        Add Ad
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="p-4">Name</th>
                                <th scope="col" className="p-4">Type</th>
                                <th scope="col" className="p-4">Placement</th>
                                <th scope="col" className="p-4">Status</th>
                                <th scope="col" className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ads.map(ad => (
                                <tr key={ad.id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    <td className="p-4 font-semibold text-gray-800 dark:text-white">{ad.name}</td>
                                    <td className="p-4 capitalize">{ad.type}</td>
                                    <td className="p-4 capitalize">{ad.placement.replace(/_/g, ' ')}</td>
                                    <td className="p-4">
                                        <ToggleSwitch isEnabled={ad.isActive} onToggle={() => handleToggleActive(ad.id)} />
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center items-center gap-4">
                                            <button onClick={() => handleEditClick(ad)} className="p-1 text-blue-500 hover:text-blue-400" title="Edit Ad"><PencilIcon /></button>
                                            <button onClick={() => setAdToDelete(ad)} className="p-1 text-red-500 hover:text-red-400" title="Delete Ad"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <AdModal
                    ad={editingAd}
                    onClose={() => { setIsModalOpen(false); setEditingAd(null); }}
                    onSave={handleSaveAd}
                />
            )}
             {adToDelete && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-xl text-center animate-fade-in-up w-full max-w-sm">
                        <h3 className="font-bold text-lg text-red-500 mb-2">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to permanently delete the '{adToDelete.name}' ad?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setAdToDelete(null)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 font-semibold text-sm">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 font-semibold text-white text-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdManagementView;