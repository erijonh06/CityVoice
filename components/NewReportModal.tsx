import React, { useState, useRef } from 'react';
import { analyzeReport } from '../services/geminiService';
import { ReportCategory } from '../types';
import { useTranslation } from '../TranslationContext';

interface NewReportModalProps {
  location: { lat: number; lng: number };
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const NewReportModal: React.FC<NewReportModalProps> = ({ location, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    setIsAnalyzing(true);
    // Use Gemini to fill in the blanks
    const analysis = await analyzeReport(description, image || undefined);
    
    const reportData = {
      description,
      imageUrl: image,
      location,
      ...analysis
    };
    
    setIsAnalyzing(false);
    onSubmit(reportData);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="bg-brand-teal p-6 text-white flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold">{t('newReport')}</h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1 transition">
            <span className="material-icons-round">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Photo Section */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">{t('photoOptional')}</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-brand-teal transition h-32 relative overflow-hidden"
            >
              {image ? (
                <img src={image} alt="Report preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-icons-round text-3xl text-gray-400">add_a_photo</span>
                  <span className="text-xs text-gray-500 mt-1">{t('clickToSnap')}</span>
                </>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
            {image && (
                <button type="button" onClick={() => setImage(null)} className="text-xs text-red-500 font-bold underline">{t('removePhoto')}</button>
            )}
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">{t('whatsWrong')}</label>
            <textarea
              className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition resize-none"
              rows={3}
              placeholder={t('example')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="text-xs text-gray-400 flex items-center gap-1">
             <span className="material-icons-round text-xs">location_on</span>
             <span>{t('location', { lat: location.lat.toFixed(5), lng: location.lng.toFixed(5) })}</span>
          </div>

          {/* AI Info */}
          <div className="bg-brand-lavender/30 rounded-xl p-3 flex items-start space-x-3">
             <span className="material-icons-round text-brand-lavender text-purple-500">auto_awesome</span>
             <p className="text-xs text-purple-700 mt-1">
               {t('aiInfo')}
             </p>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing || !description}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform active:scale-95 flex justify-center items-center space-x-2
              ${isAnalyzing || !description ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-teal hover:bg-teal-500 hover:shadow-teal-500/30'}
            `}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t('analyzing')}</span>
              </>
            ) : (
              <span>{t('submitReport')}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewReportModal;