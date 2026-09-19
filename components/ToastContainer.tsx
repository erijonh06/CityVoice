import React from 'react';
import { ToastNotification } from '../types';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border-2 transform transition-all duration-300 animate-fade-in-down w-full
            ${toast.type === 'success' ? 'bg-white border-brand-teal text-teal-800' : 
              toast.type === 'error' ? 'bg-white border-red-300 text-red-800' :
              toast.type === 'achievement' ? 'bg-gradient-to-r from-yellow-100 to-white border-yellow-400 text-yellow-900' :
              'bg-white border-gray-200 text-gray-800'}
          `}
          onClick={() => onRemove(toast.id)}
        >
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center shrink-0
            ${toast.type === 'success' ? 'bg-brand-teal text-white' : 
              toast.type === 'error' ? 'bg-red-400 text-white' :
              toast.type === 'achievement' ? 'bg-yellow-400 text-white' :
              'bg-gray-200 text-gray-600'}
          `}>
            <span className="material-icons-round text-sm">
              {toast.type === 'success' ? 'check' : 
               toast.type === 'error' ? 'error_outline' :
               toast.type === 'achievement' ? 'emoji_events' :
               'info'}
            </span>
          </div>
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes fade-in-down {
            0% { opacity: 0; transform: translateY(-20px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-down {
            animation: fade-in-down 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;