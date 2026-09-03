import React from 'react';
import { type Language } from '../types';

interface LanguageSwitcherProps {
  language: Language;
  onLanguageChange: (newLang: Language) => void;
  isTranslating?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  language,
  onLanguageChange,
  isTranslating = false,
}) => {
  return (
    <div 
      className="inline-flex items-center bg-stone-100 border border-stone-300 rounded-md p-0.5 text-xs font-semibold text-stone-700 shadow-xs select-none"
      role="group"
      aria-label="Pilih Bahasa / Select Language"
    >
      <button
        type="button"
        id="lang-btn-id"
        onClick={() => onLanguageChange('id')}
        disabled={isTranslating}
        className={`px-2.5 py-1 rounded-xs transition-all duration-150 min-w-[32px] min-h-[28px] flex items-center justify-center text-xs tracking-wide ${
          language === 'id'
            ? 'bg-[#C25E2E] text-white font-bold shadow-xs'
            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
        } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-pressed={language === 'id'}
        aria-label="Bahasa Indonesia"
      >
        ID
      </button>

      <span className="text-stone-300 text-xs px-0.5 pointer-events-none">|</span>

      <button
        type="button"
        id="lang-btn-en"
        onClick={() => onLanguageChange('en')}
        disabled={isTranslating}
        className={`px-2.5 py-1 rounded-xs transition-all duration-150 min-w-[32px] min-h-[28px] flex items-center justify-center text-xs tracking-wide ${
          language === 'en'
            ? 'bg-[#C25E2E] text-white font-bold shadow-xs'
            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
        } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-pressed={language === 'en'}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
};
