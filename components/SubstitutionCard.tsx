import React, { useState } from 'react';
import { type Substitution, type Language } from '../types';
import { translations } from '../translations';
import { RatioCalculator } from './RatioCalculator';
import { ChefHat, Utensils, Droplets, Check, Copy, Bookmark } from 'lucide-react';

interface SubstitutionCardProps {
  substitution: Substitution;
  language: Language;
  originalIngredient?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const SubstitutionCard: React.FC<SubstitutionCardProps> = ({
  substitution,
  language,
  originalIngredient = '',
  isFavorite = false,
  onToggleFavorite,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  const handleCopyRatio = async () => {
    try {
      await navigator.clipboard.writeText(
        `${substitution.substituteName} (${t.bestForLabel}: ${substitution.bestFor})\n${t.howToUseLabel}: ${substitution.howToUse}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <article className="bg-white rounded-md shadow-xs hover:shadow-sm overflow-hidden border border-stone-200 transition-all duration-150">
      {substitution.imageUrl ? (
        <div className="aspect-[16/9] max-h-44 sm:max-h-52 w-full relative bg-stone-900 overflow-hidden">
          <img 
            src={substitution.imageUrl} 
            alt={substitution.substituteName} 
            className="w-full h-full object-cover" 
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-stone-900/80 rounded-xs border border-stone-700/60 inline-flex items-center gap-1.5 text-stone-100">
              <ChefHat className="w-3 h-3 text-[#E07A4B]" />
              {t.interpretBadge}
            </span>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`p-1.5 rounded transition-all ${
                  isFavorite 
                    ? 'bg-[#C25E2E] text-white shadow-xs' 
                    : 'bg-stone-900/70 text-stone-200 hover:text-white hover:bg-stone-900'
                }`}
                title={isFavorite ? t.removeFromFavorites : t.saveToFavorites}
                aria-label={isFavorite ? t.removeFromFavorites : t.saveToFavorites}
              >
                <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#FAF6F2] flex items-center justify-between px-4 py-2.5 border-b border-stone-200/80">
          <span className="text-[11px] font-semibold text-[#9A451E] inline-flex items-center gap-1.5">
            <ChefHat className="h-3.5 w-3.5 text-[#C25E2E]" />
            {t.interpretBadge}
          </span>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`p-1.5 rounded transition-all ${
                isFavorite 
                  ? 'bg-[#C25E2E] text-white shadow-xs' 
                  : 'bg-white text-stone-600 hover:text-[#C25E2E] border border-stone-200'
              }`}
              title={isFavorite ? t.removeFromFavorites : t.saveToFavorites}
              aria-label={isFavorite ? t.removeFromFavorites : t.saveToFavorites}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
          )}
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Header: Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900 tracking-tight leading-snug break-words">
              {substitution.substituteName}
            </h3>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FAF2ED] text-[#8C3B14] text-xs font-medium rounded-xs border border-[#F2D7C9]">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#A64519] flex-shrink-0">
                {t.bestForLabel}:
              </span>
              <span className="truncate">{substitution.bestFor}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0">
            {onToggleFavorite && !substitution.imageUrl && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`p-1.5 rounded border transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${
                  isFavorite
                    ? 'bg-[#C25E2E] text-white border-[#9A451E] shadow-xs'
                    : 'bg-stone-50 text-stone-700 hover:text-[#C25E2E] hover:bg-[#FAF2ED] border-stone-200'
                }`}
                title={isFavorite ? t.removeFromFavorites : t.saveToFavorites}
                aria-label={isFavorite ? t.removeFromFavorites : t.saveToFavorites}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyRatio}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-[#C25E2E] px-2.5 py-1.5 rounded bg-stone-50 hover:bg-[#FAF2ED] border border-stone-200 hover:border-[#E8C0AB] transition-colors min-h-[32px]"
              title="Salin takaran / Copy ratio"
              aria-label="Salin takaran bahan"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">{language === 'id' ? 'Tersalin' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>{language === 'id' ? 'Salin' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Section: Flattened hierarchy without nested cards */}
        <div className="mt-4 pt-3.5 border-t border-stone-200 space-y-4">
          {/* How to use & proportions */}
          <div>
            <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs uppercase tracking-wider">
              <Utensils className="w-3.5 h-3.5 text-[#C25E2E] flex-shrink-0" />
              <h4>{t.howToUseLabel}</h4>
            </div>
            <p className="mt-1.5 text-stone-700 leading-relaxed text-xs sm:text-sm">
              {substitution.howToUse}
            </p>
          </div>

          {/* Interactive Ratio Calculator */}
          <RatioCalculator 
            substitution={substitution}
            originalIngredient={originalIngredient}
            language={language}
          />

          {/* Flavor & Texture breakdown: clean flat two columns with subtle dividers */}
          <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border-l-2 border-[#D97706] pl-2.5">
              <span className="text-stone-900 font-bold text-[11px] uppercase tracking-wider block">
                {t.flavorLabel}
              </span>
              <p className="mt-0.5 text-stone-600 text-xs leading-relaxed">
                {substitution.reasoning.flavor}
              </p>
            </div>

            <div className="border-l-2 border-emerald-600 pl-2.5">
              <div className="flex items-center gap-1 text-stone-900 font-bold text-[11px] uppercase tracking-wider">
                <Droplets className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span>{t.textureLabel}</span>
              </div>
              <p className="mt-0.5 text-stone-600 text-xs leading-relaxed">
                {substitution.reasoning.texture}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
