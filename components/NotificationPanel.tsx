import React from 'react';
import { AppNotification } from '../types';
import { useTranslation } from '../TranslationContext';

interface NotificationPanelProps {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick: (reportId: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  notifications, 
  onClose, 
  onMarkRead, 
  onClearAll,
  onNotificationClick
}) => {
  const { t } = useTranslation();
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[4px] z-[2000] animate-fade-in"
        onClick={onClose}
      />
      
      {/* Side Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-slate-900 shadow-[-20px_0_50px_rgba(0,0,0,0.2)] z-[2001] overflow-hidden flex flex-col animate-slide-in-right transition-colors border-l border-gray-100 dark:border-slate-800">
        <div className="p-7 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div>
            <h3 className="font-display font-bold text-2xl text-gray-800 dark:text-white flex items-center gap-2">
              <span className="material-icons-round text-brand-teal text-3xl">notifications_active</span>
              {t('activityFeed')}
            </h3>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">{t('liveFromNeighborhood')}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition active:scale-90"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-4 opacity-30">
              <div className="w-24 h-24 rounded-[2.5rem] bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-icons-round text-5xl text-gray-300">notifications_none</span>
              </div>
              <div>
                <p className="text-xl font-display font-bold text-gray-500 dark:text-slate-400">{t('allCaughtUp')}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{t('checkBackLater')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center px-2 mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{notifications.length} {t('unreadUpdates')}</span>
                <button 
                  onClick={onClearAll}
                  className="text-[10px] font-bold text-brand-teal hover:underline uppercase tracking-widest transition"
                >
                  {t('clearAll')}
                </button>
              </div>
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => {
                    onMarkRead(n.id);
                    if (n.linkToReportId) onNotificationClick(n.linkToReportId);
                  }}
                  className={`p-6 rounded-[2rem] flex gap-5 cursor-pointer transition-all relative border-2 group
                    ${n.isRead 
                      ? 'bg-transparent border-transparent' 
                      : 'bg-white dark:bg-slate-800/50 border-brand-teal/10 shadow-lg shadow-black/5'}
                    hover:border-brand-teal/30 hover:bg-gray-50 dark:hover:bg-slate-800
                  `}
                >
                  {!n.isRead && (
                    <div className="absolute top-8 left-2 w-2 h-2 bg-brand-teal rounded-full shadow-[0_0_10px_rgba(79,209,197,0.8)]"></div>
                  )}
                  
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110
                    ${n.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-500' :
                      n.type === 'alert' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' :
                      n.type === 'badge' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' :
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}
                  `}>
                    <span className="material-icons-round text-3xl">
                      {n.type === 'success' ? 'check_circle' :
                       n.type === 'alert' ? 'report_problem' :
                       n.type === 'badge' ? 'stars' : 'offline_bolt'}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`text-sm font-bold leading-tight ${n.isRead ? 'text-gray-600 dark:text-slate-400' : 'text-gray-900 dark:text-white'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold whitespace-nowrap mt-0.5 uppercase">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    {n.linkToReportId && (
                      <div className="mt-3 flex items-center text-[10px] font-bold text-brand-teal group-hover:translate-x-1 transition-transform uppercase tracking-widest">
                        <span>{t('viewDetails')}</span>
                        <span className="material-icons-round text-sm ml-0.5">arrow_right_alt</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-7 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 transition-colors">
          <button className="w-full py-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 text-xs font-bold text-gray-600 dark:text-slate-300 hover:border-brand-teal transition flex items-center justify-center gap-2 shadow-sm">
            <span className="material-icons-round text-sm">history_toggle_off</span>
            {t('fullHistory')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
};

export default NotificationPanel;