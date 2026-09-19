
import React, { useState, useRef } from 'react';
import { User, Report, ReportStatus, AVATAR_FRAMES, UserRole } from '../types';
import { useTranslation } from '../TranslationContext';

interface ProfileProps {
  user: User;
  reports: Report[];
  onLogout: (forceToSignUp?: boolean) => void;
  onUpdateUser: (updates: Partial<User>) => void;
  onResetDb: () => void;
  isDarkMode?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ user, reports, onLogout, onUpdateUser, onResetDb, isDarkMode }) => {
  const { t } = useTranslation();
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isGuest = user.role === UserRole.GUEST;
  const myReports = reports.filter(r => r.userId === user.id);
  const mySolved = myReports.filter(r => r.status === ReportStatus.SOLVED).length;
  const myVotes = myReports.reduce((acc, r) => acc + r.votes, 0);
  const impactScore = (myReports.length * 10) + (myVotes * 5) + (mySolved * 50);

  const level = Math.floor(user.points / 100) + 1;
  const progress = user.points % 100;

  const currentFrameClass = AVATAR_FRAMES.find(f => f.id === user.avatarFrame)?.class || 'border-white dark:border-slate-800';

  return (
    <div className="h-full overflow-y-auto bg-gray-50/50 dark:bg-slate-950/50 pb-32 transition-colors">
      <div className="relative w-full h-48 sm:h-64 overflow-hidden group">
        {user.coverPhoto ? (
          <img src={user.coverPhoto} className="w-full h-full object-cover" alt="cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-teal to-blue-600 opacity-80" />
        )}
        {!isGuest && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <button onClick={() => coverInputRef.current?.click()} className="bg-white/90 p-3 rounded-2xl flex items-center gap-2 shadow-xl font-bold text-sm">
              <span className="material-icons-round">add_photo_alternate</span> {t('changeCover')}
            </button>
          </div>
        )}
        <input ref={coverInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const r = new FileReader();
            r.onload = () => onUpdateUser({ coverPhoto: r.result as string });
            r.readAsDataURL(file);
          }
        }} />
      </div>

      <div className="max-w-2xl mx-auto flex flex-col items-center -mt-20 px-6 space-y-6 relative z-10">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl w-full rounded-[2.5rem] p-8 shadow-2xl border border-white dark:border-slate-800 flex flex-col items-center text-center">
          
          <div className={`relative mb-4 group ${!isGuest ? 'cursor-pointer' : ''}`} onClick={() => !isGuest && fileInputRef.current?.click()}>
            <div className={`w-32 h-32 rounded-full border-[6px] shadow-xl overflow-hidden ${currentFrameClass}`}>
              <img src={user.avatar} className="w-full h-full object-cover bg-gray-200" alt="avatar" />
            </div>
            {!isGuest && (
              <div className="absolute bottom-1 right-1 bg-brand-teal text-white p-2 rounded-2xl shadow-lg border-4 border-white">
                <span className="material-icons-round text-sm">photo_camera</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const r = new FileReader();
                r.onload = () => onUpdateUser({ avatar: r.result as string });
                r.readAsDataURL(file);
              }
            }} />
          </div>
          
          {isGuest && (
            <div className="mb-2 bg-brand-teal/10 text-brand-teal px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-teal/20">
               {t('guestModeLimited')}
            </div>
          )}

          <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-white">{isGuest ? t('explorer') : user.name}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Level {level} {user.role === UserRole.ADMIN ? t('official') : t('citizen')} • <span className="text-brand-teal">{impactScore} {t('impact')}</span></p>

          {!isGuest && (
            <div className="w-full mt-8">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  <span>{t('xpProgress')}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-teal" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
          )}
          
          <div className="mt-8 grid grid-cols-3 gap-8 w-full pt-8 border-t border-gray-100 dark:border-slate-800/50">
            <div className="flex flex-col items-center"><span className="text-2xl font-bold text-brand-teal">{user.points}</span><span className="text-[10px] text-gray-400 font-bold uppercase">{t('xp')}</span></div>
            <div className="flex flex-col items-center"><span className="text-2xl font-bold text-rose-500">{myVotes}</span><span className="text-[10px] text-gray-400 font-bold uppercase">{t('votes')}</span></div>
            <div className="flex flex-col items-center"><span className="text-2xl font-bold text-blue-500">{myReports.length}</span><span className="text-[10px] text-gray-400 font-bold uppercase">{t('reports')}</span></div>
          </div>
        </div>

        {/* Mock DB Controls */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-white dark:border-slate-800 space-y-6">
            <h3 className="font-display font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="material-icons-round text-brand-teal">storage</span> {t('neighborhoodDataGrid')}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {isGuest 
                ? t('guestDataTemporary')
                : t('dataStoredLocally')
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <button onClick={onResetDb} className="flex-1 bg-rose-50 dark:bg-rose-950/30 text-rose-500 py-4 rounded-2xl text-xs font-bold hover:bg-rose-100 transition flex items-center justify-center gap-2">
                  <span className="material-icons-round">delete_sweep</span> {t('clearGridCache')}
               </button>
               <button onClick={() => onLogout()} className="flex-1 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 py-4 rounded-2xl text-xs font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2">
                  <span className="material-icons-round">logout</span> {t('endSession')}
               </button>
            </div>
        </div>

        {isGuest && (
          <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-lg border border-brand-teal border-dashed flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
                  <span className="material-icons-round text-brand-teal text-3xl">how_to_reg</span>
              </div>
              <h4 className="font-display font-bold text-gray-800 dark:text-white">{t('becomeFullCitizen')}</h4>
              <p className="text-xs text-gray-500">{t('registeredCitizensEarn')}</p>
              <button onClick={() => onLogout(true)} className="text-brand-teal font-bold text-xs hover:underline">{t('signUpNow')}</button>
          </div>
        )}

        {!isGuest && (
          <div className="w-full bg-gradient-to-br from-brand-teal to-blue-500 rounded-[2rem] p-8 shadow-lg text-white">
              <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">{t('cityAchievement')}</h4>
              <p className="text-xl font-display font-bold">{t('theSilentGuardian')}</p>
              <div className="mt-4 flex items-center gap-2">
                  <span className="material-icons-round">verified</span>
                  <span className="text-xs font-bold">{t('reportsSynced')}</span>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
