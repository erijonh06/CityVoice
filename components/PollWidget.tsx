import React, { useState } from 'react';
import { useTranslation } from '../TranslationContext';

const PollWidget = () => {
  const { t } = useTranslation();
  const [voted, setVoted] = useState<number | null>(null);
  
  const options = [
    { id: 1, text: t('moreBikeLanes'), percent: 45 },
    { id: 2, text: t('betterStreetLights'), percent: 35 },
    { id: 3, text: t('publicWifiZones'), percent: 20 },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 w-64 pointer-events-auto animate-fade-in-up hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-teal text-white flex items-center justify-center">
                <span className="material-icons-round text-sm">poll</span>
            </div>
            {t('communityPoll')}
        </h3>
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{t('live')}</span>
      </div>
      
      <p className="text-xs text-gray-600 mb-3 font-medium leading-tight">{t('cityPriorityQuestion')}</p>
      
      <div className="space-y-2">
        {options.map((opt) => (
            <button
                key={opt.id}
                onClick={(e) => { e.stopPropagation(); setVoted(opt.id); }}
                disabled={voted !== null}
                className="w-full relative h-8 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 transition-all active:scale-95 hover:bg-gray-200 disabled:hover:bg-gray-100 disabled:cursor-default group"
            >
                {/* Result Bar */}
                <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${voted === opt.id ? 'bg-brand-teal/20' : 'bg-gray-300/20'}`}
                    style={{ width: voted ? `${opt.percent}%` : '0%' }}
                ></div>
                
                <div className="absolute inset-0 flex items-center justify-between px-3 text-xs">
                    <span className={`font-bold z-10 transition-colors ${voted === opt.id ? 'text-brand-teal' : 'text-gray-600'}`}>{opt.text}</span>
                    {voted && (
                        <span className="font-bold text-gray-500 z-10 animate-fade-in">{opt.percent}%</span>
                    )}
                </div>
            </button>
        ))}
      </div>
      <div className="mt-3 flex justify-between items-center">
          <span className="text-[10px] text-gray-400">{voted ? t('thanksForVoting') : t('votesSoFar')}</span>
          <span className="text-[10px] text-brand-teal font-bold cursor-pointer hover:underline">{t('viewReport')}</span>
      </div>
    </div>
  );
};
export default PollWidget;