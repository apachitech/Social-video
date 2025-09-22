import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronDownIcon } from '../icons/Icons';
import { View } from '../../App';

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-zinc-700 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left p-4 hover:bg-zinc-700/50"
      >
        <span className="font-semibold">{question}</span>
        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 bg-zinc-800 text-gray-300 text-sm animate-fade-in-up">
          {children}
        </div>
      )}
    </div>
  );
};

const faqData = {
  "Account Management": [
    { q: "How do I change my password?", a: "You can change your password by navigating to Profile > Settings > Manage Account > Change Password." },
    { q: "How do I delete my account?", a: "To permanently delete your account, go to Profile > Settings > Manage Account and select 'Delete Account'. Please note this action is irreversible." },
  ],
  "Coins, Rewards & Tasks": [
    {
      q: "How can I earn free coins or XP?",
      a: "You can earn rewards by checking in daily to claim your Daily Reward. Additionally, you can complete tasks, like watching short video ads, to earn even more coins and XP.",
      linkView: 'tasks' as View,
      linkText: "Go to Daily Tasks now."
    },
    { q: "What are Coins used for?", a: "Coins are the virtual currency on Vidora. You can use them to send virtual gifts to your favorite creators during their live streams, showing your support and helping them earn." },
    { q: "What is XP and Leveling up?", a: "XP (Experience Points) helps you level up your account. Leveling up shows your dedication to the community and unlocks special profile badges and rewards over time. You can earn XP by completing tasks and engaging with the platform." },
  ],
  "Creator Program": [
    { 
        q: "How can I become a creator?", 
        a: "To become a creator and unlock monetization features, you must meet certain criteria set by the admins, such as reaching a minimum number of followers, total video views, and uploaded videos. You can check your progress and apply once you meet the requirements on the 'Become a Creator' page.",
        linkView: 'becomeCreator' as View,
        linkText: "Check your progress and apply here."
    },
     { q: "How do I request a payout?", a: "Creators can request a payout from their Creator Dashboard, accessible from the profile page. You must meet the minimum payout threshold." },
  ],
  "Content & Features": [
    { q: "How do I go live?", a: "To start a live stream, tap the 'Live' icon in the bottom navigation, then tap the 'Go Live' button. You must have creator status to use this feature." },
    { q: "Who can comment on my videos?", a: "You can control who comments on your videos in Profile > Settings > Who can comment. You can choose between 'Everyone', 'People you follow', or 'Nobody'." },
    { q: "Why am I seeing ads?", a: "Ads help support the platform and our creators, allowing us to keep many features free. We try to make them as relevant and unobtrusive as possible. Some ads are part of optional tasks that reward you for watching." },
  ],
  "Safety & Privacy": [
    { q: "How do I report a user or video?", a: "To report content or a user, tap the 'Share' icon on a video and look for the 'Report' option. For user profiles, tap the three-dot menu to find the report function." },
    { q: "What is a private account?", a: "Setting your account to private means only users you approve can follow you and see your content. You can change this in Profile > Settings." },
  ],
};

interface HelpCenterViewProps {
    onBack: () => void;
    onNavigate: (view: View) => void;
}

const HelpCenterView: React.FC<HelpCenterViewProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="h-full w-full bg-zinc-900 text-white flex flex-col">
      <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
        <button onClick={onBack} className="mr-4">
          <ChevronLeftIcon />
        </button>
        <h1 className="text-lg font-bold">Help Center</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {Object.entries(faqData).map(([category, faqs]) => (
          <div key={category} className="mb-6">
            <h2 className="text-lg font-bold text-pink-400 mb-3">{category}</h2>
            <div className="bg-zinc-800 rounded-lg overflow-hidden">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.q}>
                    <p>{faq.a}</p>
                    {faq.linkView && (
                        <button 
                            onClick={() => onNavigate(faq.linkView)}
                            className="text-pink-400 font-semibold hover:underline mt-2"
                        >
                            {faq.linkText}
                        </button>
                    )}
                </FAQItem>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default HelpCenterView;