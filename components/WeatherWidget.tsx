import React from 'react';
import { useTranslation } from '../TranslationContext';

export type WeatherType = 'SUNNY' | 'RAINY' | 'NIGHT';

interface WeatherWidgetProps {
  weather: WeatherType;
  onChange: (w: WeatherType) => void;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, onChange }) => {
  const { t } = useTranslation();
  const toggleWeather = () => {
    if (weather === 'SUNNY') onChange('RAINY');
    else if (weather === 'RAINY') onChange('NIGHT');
    else onChange('SUNNY');
  };

  return (
    <button
      onClick={toggleWeather}
      className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-white/50 flex items-center gap-2 hover:scale-105 transition-transform group"
      title={t('toggleWeather')}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
        ${weather === 'SUNNY' ? 'bg-orange-100 text-orange-500' : 
          weather === 'RAINY' ? 'bg-blue-100 text-blue-500' : 'bg-indigo-900 text-yellow-300'}
      `}>
        <span className="material-icons-round text-2xl group-hover:animate-spin-slow">
          {weather === 'SUNNY' ? 'wb_sunny' : weather === 'RAINY' ? 'water_drop' : 'nights_stay'}
        </span>
      </div>
      <div className="hidden md:block text-left mr-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase">{t('weather')}</div>
        <div className="text-xs font-bold text-gray-700">
          {weather === 'SUNNY' ? t('sunny') : weather === 'RAINY' ? t('rainy') : t('clear')}
        </div>
      </div>
      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
};

export default WeatherWidget;