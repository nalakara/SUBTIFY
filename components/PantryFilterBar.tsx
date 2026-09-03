import React from 'react';
import { type PantryFilterId, type Language } from '../types';
import { PANTRY_FILTERS } from '../constants/filters';
import { translations } from '../translations';
import { SlidersHorizontal, X } from 'lucide-react';

interface PantryFilterBarProps {
  selectedFilters: PantryFilterId[];
  onToggleFilter: (filterId: PantryFilterId) => void;
  onClearFilters: () => void;
  language: Language;
  disabled?: boolean;
}

export const PantryFilterBar: React.FC<PantryFilterBarProps> = ({
  selectedFilters,
  onToggleFilter,
  onClearFilters,
  language,
  disabled = false,
}) => {
  const t = translations[language];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#C25E2E]" />
          <span>{t.pantryFiltersHeading}</span>
        </div>

        {selectedFilters.length > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            disabled={disabled}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C25E2E] hover:text-[#9A451E] transition-colors"
          >
            <X className="w-3 h-3" />
            <span>{t.clearFilters}</span>
          </button>
        )}
      </div>

      {/* Filter Chips Container */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {PANTRY_FILTERS.map((filter) => {
          const isSelected = selectedFilters.includes(filter.id);
          const label = language === 'id' ? filter.labelId : filter.labelEn;

          return (
            <button
              key={filter.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggleFilter(filter.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all min-h-[32px] select-none ${
                isSelected
                  ? 'bg-[#C25E2E] text-white shadow-xs border border-[#9A451E]'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 hover:border-stone-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
              aria-pressed={isSelected}
            >
              <span className="text-sm leading-none">{filter.icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
