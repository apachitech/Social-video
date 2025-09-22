
import React, { useState } from 'react';
import { SavedPaymentMethod, PaymentProvider } from '../types';
import { CloseIcon } from './icons/Icons';

interface AddPaymentMethodModalProps {
  onClose: () => void;
  onAddMethod: (method: Omit<SavedPaymentMethod, 'id'>) => void;
  availableMethods: PaymentProvider[];
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({ onClose, onAddMethod, availableMethods }) => {
  const [activeTab, setActiveTab] = useState<string | null>(availableMethods[0]?.id || null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isDefault, setIsDefault] = useState(true);

  const selectedProvider = availableMethods.find(m => m.id === activeTab);

  const handleSave = () => {
    if (!selectedProvider) {
        alert("Please select a valid payment method.");
        return;
    }

    if (selectedProvider.name === 'Card') {
      if (cardNumber.length < 16 || expiry.length < 4 || cvc.length < 3) {
        alert('Please fill in all card details correctly.');
        return;
      }
      const last4 = cardNumber.slice(-4);
      onAddMethod({
        type: 'Card',
        details: `Visa ending in ${last4}`,
        isDefault,
      });
    } else {
      // Simulate connecting other provider types
      const details = selectedProvider.name === 'PayPal'
        ? `user-paypal@example.com`
        : `Connected via ${selectedProvider.name}`;
        
      onAddMethod({
        type: selectedProvider.name,
        details,
        isDefault,
      });
    }
  };
  
  const gridColsClass = `grid-cols-${Math.min(availableMethods.length, 4)}`;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-sm text-white relative animate-fade-in-up">
        <header className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-xl font-bold">Add Payment Method</h2>
          <button onClick={onClose}><CloseIcon /></button>
        </header>
        
        {availableMethods.length > 0 && (
            <div className={`p-1 bg-zinc-700 m-4 rounded-lg grid ${gridColsClass} gap-1`}>
                {availableMethods.map(method => (
                    <button key={method.id} onClick={() => setActiveTab(method.id)} className={`py-2 text-sm font-semibold rounded ${activeTab === method.id ? 'bg-pink-600' : 'hover:bg-zinc-600'}`}>
                        {method.name}
                    </button>
                ))}
            </div>
        )}

        <main className="p-6 pt-0 min-h-[180px]">
            {selectedProvider?.name === 'Card' && (
                <div className="space-y-4 animate-fade-in-fast">
                    <input type="text" placeholder="Card Number" maxLength={16} value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full p-2 bg-zinc-700 rounded-md" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM/YY" maxLength={4} value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full p-2 bg-zinc-700 rounded-md" />
                        <input type="text" placeholder="CVC" maxLength={3} value={cvc} onChange={e => setCvc(e.target.value)} className="w-full p-2 bg-zinc-700 rounded-md" />
                    </div>
                </div>
            )}
            {selectedProvider?.name === 'PayPal' && (
                <div className="text-center animate-fade-in-fast">
                    <button className="w-full bg-[#0070ba] py-3 rounded-lg font-semibold">Connect with PayPal</button>
                    <p className="text-xs text-gray-400 mt-2">You will be redirected to PayPal to complete the connection.</p>
                </div>
            )}
            {selectedProvider && !['Card', 'PayPal'].includes(selectedProvider.name) && (
                 <div className="text-center animate-fade-in-fast">
                    <button className="w-full bg-blue-600 py-3 rounded-lg font-semibold">Connect with {selectedProvider.name}</button>
                    <p className="text-xs text-gray-400 mt-2">You will be redirected to {selectedProvider.name} to complete the connection.</p>
                </div>
            )}
            {availableMethods.length > 0 && (
                <div className="flex items-center mt-4">
                    <input id="is-default" type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                    <label htmlFor="is-default" className="ml-2 text-sm">Set as default payment method</label>
                </div>
            )}
        </main>
        
        <footer className="p-4 border-t border-zinc-700">
          <button onClick={handleSave} disabled={!selectedProvider} className="w-full py-3 font-semibold rounded-lg bg-pink-600 hover:bg-pink-700 disabled:opacity-50">Save Method</button>
        </footer>
      </div>
    </div>
  );
};

export default AddPaymentMethodModal;
      