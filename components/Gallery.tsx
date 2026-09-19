import React, { useState } from 'react';
import { Report, ReportStatus, ReportCategory } from '../types';
import { useTranslation } from '../TranslationContext';

interface GalleryProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
  isDarkMode?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ reports, onReportClick, isDarkMode }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<'NEWEST' | 'VOTES'>('NEWEST');

  const filteredReports = reports.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            r.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || r.category === selectedCategory;
      return matchesSearch && matchesCategory;
  }).sort((a, b) => {
      if (sortBy === 'NEWEST') return b.timestamp - a.timestamp;
      if (sortBy === 'VOTES') return b.votes - a.votes;
      return 0;
  });

  return (
    <div className="h-full overflow-y-auto p-6 pb-20 relative transition-colors">
      <div className="sticky top-0 z-20 -mx-6 px-6 py-4 bg-brand-bg/95 dark:bg-brand-darkBg/95 backdrop-blur-md mb-6 border-b border-gray-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="material-icons-round text-brand-rose">photo_library</span>
                {t('cityMoments')}
              </h2>
              <div className="relative w-full md:w-64">
                  <input 
                      type="text" 
                      placeholder={t('searchReports')} 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-teal dark:text-white transition shadow-sm"
                  />
                  <span className="material-icons-round absolute left-3 top-2 text-gray-400 dark:text-slate-600 text-lg">search</span>
              </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
                {['All', ...Object.values(ReportCategory)].map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${selectedCategory === cat ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200' : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:border-gray-400'}`}>
                        {cat}
                    </button>
                ))}
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-brand-teal">
                <option value="NEWEST">{t('newestFirst')}</option>
                <option value="VOTES">{t('mostLoved')}</option>
            </select>
          </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredReports.map(report => (
          <div key={report.id} onClick={() => onReportClick(report)} className="group relative aspect-square bg-gray-100 dark:bg-slate-800 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all border border-white dark:border-slate-800">
            {report.imageUrl ? (
              <img src={report.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-700">
                <span className="material-icons-round text-5xl">inventory_2</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <span className="text-white font-bold text-sm truncate">{report.title}</span>
              <span className="text-white/70 text-[10px]">{report.userName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;