
import React from 'react';
import { User } from '../types';
import { useTranslation } from '../TranslationContext';

interface LeaderboardProps {
  reports: any[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ reports }) => {
  const { t } = useTranslation();
  // Mocking some other users for a full leaderboard feel
  const leaders = [
    { id: 'u1', name: 'Alex Citizen', points: 1250, reports: 12, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
    { id: 'u2', name: 'Jane Doe', points: 980, reports: 8, avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 'u3', name: 'Mike T', points: 840, reports: 15, avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 'u4', name: 'Sarah Green', points: 720, reports: 5, avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: 'u5', name: 'Chris P', points: 610, reports: 4, avatar: 'https://i.pravatar.cc/150?u=5' },
    { id: 'u6', name: 'Lisa V', points: 550, reports: 3, avatar: 'https://i.pravatar.cc/150?u=6' },
    { id: 'u7', name: 'David B', points: 420, reports: 6, avatar: 'https://i.pravatar.cc/150?u=7' },
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="h-full overflow-y-auto p-6 pb-24 transition-colors">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="text-center space-y-2">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pop-in shadow-xl shadow-amber-200/50">
                <span className="material-icons-round text-amber-500 text-5xl">emoji_events</span>
            </div>
            <h2 className="text-4xl font-display font-bold text-gray-800 dark:text-white tracking-tight">{t('cityVoiceLegends')}</h2>
            <p className="text-gray-500 dark:text-slate-400 font-medium">{t('heroesShaping')}</p>
        </header>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-white dark:border-slate-800 overflow-hidden divide-y divide-gray-50 dark:divide-slate-800 transition-colors">
          {leaders.map((leader, index) => (
            <div key={leader.id} className="p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition group">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${index === 0 ? 'bg-amber-400 text-white shadow-lg shadow-amber-200' : 
                      index === 1 ? 'bg-gray-300 text-white shadow-lg shadow-gray-200' : 
                      index === 2 ? 'bg-orange-300 text-white shadow-lg shadow-orange-200' : 
                      'text-gray-400 dark:text-slate-600'}
                `}>
                    {index + 1}
                </div>
                
                <div className="relative">
                  <img src={leader.avatar} alt={leader.name} className="w-12 h-12 rounded-2xl border-2 border-white dark:border-slate-700 shadow-sm object-cover" />
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1">
                       <span className={`material-icons-round text-xs ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : 'text-orange-400'}`}>stars</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                    <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-[#2D9B63] transition-colors">{leader.name}</h4>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest font-bold">{leader.reports} {t('activeReports')}</p>
                </div>
                
                <div className="text-right">
                    <div className="text-lg font-display font-bold text-[#2D9B63]">{leader.points}</div>
                    <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{t('moraleXP')}</div>
                </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[#2D9B63]/10 to-blue-500/10 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-3xl border border-[#2D9B63]/20 dark:border-slate-800 flex items-center gap-4 animate-fade-in-up">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-icons-round text-[#2D9B63]">tips_and_updates</span>
            </div>
            <div>
                <h4 className="font-bold text-gray-800 dark:text-white text-sm">{t('climbRankings')}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{t('reportingEarnsXP')}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
