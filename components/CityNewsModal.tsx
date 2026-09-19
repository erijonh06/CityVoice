import React from 'react';
import { useTranslation } from '../TranslationContext';

interface CityNewsModalProps {
  onClose: () => void;
}

const CityNewsModal: React.FC<CityNewsModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const news = [
    { id: 1, title: t('townHallMeeting'), date: 'Oct 15', content: t('joinDiscussion'), type: 'Event' },
    { id: 2, title: t('streetSweepingSchedule'), date: 'Every Tue', content: t('rememberMoveCars'), type: 'Alert' },
    { id: 3, title: t('recyclingProgramUpdate'), date: 'Oct 10', content: t('newBlueBins'), type: 'Info' }
  ];

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
       <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-fade-in-up">
          <div className="bg-gradient-to-r from-blue-500 to-brand-teal p-6 text-white flex justify-between items-center shrink-0">
             <h2 className="text-2xl font-display font-bold flex items-center gap-2">
               <span className="material-icons-round">campaign</span> {t('cityNews')}
             </h2>
             <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition"><span className="material-icons-round">close</span></button>
          </div>
          <div className="p-6 overflow-y-auto space-y-4">
             {news.map(item => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                            ${item.type === 'Event' ? 'bg-orange-100 text-orange-600' : 
                              item.type === 'Alert' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`
                        }>
                            {item.type}
                        </span>
                        <span className="text-xs text-gray-400 font-bold">{item.date}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{item.title}</h3>
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{item.content}</p>
                </div>
             ))}
             <div className="text-center pt-4">
                 <button className="text-brand-teal font-bold text-sm hover:underline">{t('viewArchive')}</button>
             </div>
          </div>
       </div>
    </div>
  );
};
export default CityNewsModal;