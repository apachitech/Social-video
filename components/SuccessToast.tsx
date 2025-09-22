import React, { useEffect, useState } from 'react';

interface SuccessToastProps {
  message: string;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 2700); // A bit less than the parent timer to allow for fade-out animation
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div 
            className={`fixed top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
            role="alert"
            aria-live="assertive"
        >
            <p className="font-semibold">{message}</p>
        </div>
    );
};
export default SuccessToast;
