import React from 'react';
import { ChevronLeftIcon } from '../icons/Icons';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-pink-400">{title}</h2>
        <div className="space-y-3 text-gray-300 text-sm">
            {children}
        </div>
    </div>
);


const TermsOfServiceView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="h-full w-full bg-zinc-900 text-white flex flex-col">
      <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
        <button onClick={onBack} className="mr-4">
          <ChevronLeftIcon />
        </button>
        <h1 className="text-lg font-bold">Terms of Service</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <p className="text-xs text-gray-500 mb-4">Last Updated: July 21, 2024</p>
        
        <Section title="1. Acceptance of Terms">
            <p>[Placeholder] Welcome to Vidora! By accessing or using our application, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.</p>
        </Section>
        
        <Section title="2. User Conduct">
            <p>[Placeholder] You are responsible for your conduct and content on Vidora. You agree not to post content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. You also agree not to impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity.</p>
        </Section>
        
        <Section title="3. Content Ownership">
            <p>[Placeholder] You retain ownership of the content you post on Vidora. However, by posting content, you grant Vidora a worldwide, non-exclusive, royalty-free license to use, reproduce, distribute, prepare derivative works of, display, and perform your content in connection with the service.</p>
        </Section>

        <Section title="4. Monetization and Payments">
            <p>[Placeholder] Vidora provides features for creators to earn money through virtual gifts and other means. All transactions are subject to our payment policies and processing fees, which may be updated from time to time. You are responsible for any taxes associated with your earnings.</p>
        </Section>
        
        <Section title="5. Termination">
            <p>[Placeholder] We may terminate or suspend your account at any time, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will immediately cease.</p>
        </Section>
        
        <Section title="6. Disclaimers and Limitation of Liability">
            <p>[Placeholder] The service is provided on an "AS IS" and "AS AVAILABLE" basis. Vidora makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties. In no event shall Vidora be liable for any damages arising out of the use or inability to use the materials on Vidora's application.</p>
        </Section>

      </main>
    </div>
  );
};

export default TermsOfServiceView;
