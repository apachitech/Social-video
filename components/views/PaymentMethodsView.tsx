import React from 'react';
import { User } from '../../types';
import { ChevronLeftIcon, TrashIcon, PlusCircleIcon } from '../icons/Icons';

interface PaymentMethodsViewProps {
  user: User;
  onBack: () => void;
  onAddMethod: () => void;
  onRemoveMethod: (methodId: string) => void;
}

// FIX: Added a map for payment icons to make the component more extensible and handle different payment types.
const paymentIcons: { [key: string]: string } = {
    'Card': '💳',
    'PayPal': '🅿️',
    'Google Pay': '🇬',
    'Mobile Money': '📱',
    'Payoneer': '℗',
};

const PaymentMethodItem: React.FC<{
    type: string;
    details: string;
    isDefault: boolean;
    onRemove: () => void;
}> = ({ type, details, isDefault, onRemove }) => {
    const icon = paymentIcons[type] || '💵';
    return (
        <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-4">
                <span className="text-3xl">{icon}</span>
                <div>
                    <p className="font-semibold">{details}</p>
                    {isDefault && <p className="text-xs text-green-400">Default</p>}
                </div>
            </div>
            <button onClick={onRemove} className="p-2 text-red-500 hover:text-red-400">
                <TrashIcon />
            </button>
        </div>
    );
};

const PaymentMethodsView: React.FC<PaymentMethodsViewProps> = ({ user, onBack, onAddMethod, onRemoveMethod }) => {
    const savedMethods = user.savedPaymentMethods || [];
    return (
        <div className="h-full w-full bg-zinc-900 text-white flex flex-col">
            <header className="sticky top-0 bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-zinc-800">
                <button onClick={onBack} className="mr-4">
                    <ChevronLeftIcon />
                </button>
                <h1 className="text-lg font-bold">Payment Methods</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-3">
                {savedMethods.length > 0 ? (
                    savedMethods.map(method => (
                        <PaymentMethodItem
                            key={method.id}
                            // FIX: The `type` prop of PaymentMethodItem was too restrictive ('Card' | 'PayPal'), causing a type error. It has been changed to `string` to accommodate various payment method types from the backend.
                            type={method.type}
                            details={method.details}
                            isDefault={method.isDefault}
                            onRemove={() => onRemoveMethod(method.id)}
                        />
                    ))
                ) : (
                    <div className="text-center text-gray-400 py-10">
                        <p>No saved payment methods.</p>
                    </div>
                )}
            </main>

            <footer className="p-4 border-t border-zinc-800">
                <button
                    onClick={onAddMethod}
                    className="w-full py-3 font-semibold rounded-lg bg-pink-600 hover:bg-pink-700 flex items-center justify-center gap-2"
                >
                    <PlusCircleIcon />
                    Add New Method
                </button>
            </footer>
        </div>
    );
};

export default PaymentMethodsView;