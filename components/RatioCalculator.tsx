import React, { useState, useMemo } from 'react';
import { type Substitution, type Language } from '../types';
import { translations } from '../translations';
import { Calculator, Sparkles, Check, Copy, RotateCcw, ArrowRight } from 'lucide-react';

interface RatioCalculatorProps {
  substitution: Substitution;
  originalIngredient: string;
  language: Language;
}

const COMMON_UNITS_ID = ['ml', 'sdm (sendok makan)', 'sdt (sendok teh)', 'gram (g)', 'cangkir (cup)', 'buah/butir'];
const COMMON_UNITS_EN = ['ml', 'tbsp (tablespoon)', 'tsp (teaspoon)', 'grams (g)', 'cup', 'piece(s)'];

export const RatioCalculator: React.FC<RatioCalculatorProps> = ({
  substitution,
  originalIngredient,
  language,
}) => {
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  
  // Base ratio detection or fallback 1:1
  const baseOriginalAmount = substitution.ratio?.originalAmount || 1;
  const baseOriginalUnit = substitution.ratio?.originalUnit || (language === 'id' ? 'sdm' : 'tbsp');
  const baseSubAmount = substitution.ratio?.substituteAmount || 1;
  const baseSubUnit = substitution.ratio?.substituteUnit || baseOriginalUnit;
  const prepTip = substitution.ratio?.prepTip || '';

  const [inputAmount, setInputAmount] = useState<number>(baseOriginalAmount);
  const [selectedUnit, setSelectedUnit] = useState<string>(baseOriginalUnit);
  const [copied, setCopied] = useState(false);

  // Unit options
  const unitOptions = language === 'id' ? COMMON_UNITS_ID : COMMON_UNITS_EN;

  // Multiplier ratio: substituteAmount / originalAmount
  const multiplier = baseOriginalAmount > 0 ? baseSubAmount / baseOriginalAmount : 1;

  // Calculated substitute amount
  const calculatedSubAmount = useMemo(() => {
    const val = inputAmount * multiplier;
    // Format nicely without ugly decimals like 1.333333
    return Number(val.toFixed(2));
  }, [inputAmount, multiplier]);

  // Scaled prep tip note (if numbers exist in prepTip, e.g. 1 sdm jeruk nipis scaled)
  const calculatedTip = useMemo(() => {
    if (!prepTip) return '';
    const scaleFactor = baseOriginalAmount > 0 ? inputAmount / baseOriginalAmount : 1;
    if (Math.abs(scaleFactor - 1) < 0.05) return prepTip;
    return `${prepTip} (${language === 'id' ? `skala ${scaleFactor.toFixed(1)}x` : `scaled ${scaleFactor.toFixed(1)}x`})`;
  }, [prepTip, inputAmount, baseOriginalAmount, language]);

  const handlePresetScale = (factor: number) => {
    setInputAmount(Number((baseOriginalAmount * factor).toFixed(2)));
  };

  const handleCopyCalculation = async () => {
    const text = language === 'id'
      ? `Konversi Resep SUBTIFY:\nResep butuh: ${inputAmount} ${selectedUnit} ${originalIngredient}\nGanti dengan: ${calculatedSubAmount} ${selectedUnit} ${substitution.substituteName} ${calculatedTip ? `(${calculatedTip})` : ''}`
      : `SUBTIFY Recipe Conversion:\nOriginal recipe: ${inputAmount} ${selectedUnit} ${originalIngredient}\nReplace with: ${calculatedSubAmount} ${selectedUnit} ${substitution.substituteName} ${calculatedTip ? `(${calculatedTip})` : ''}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  return (
    <div className="border border-stone-200 rounded-md bg-[#FAF7F4] overflow-hidden transition-all duration-150">
      {/* Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full px-3.5 py-2 flex items-center justify-between text-left hover:bg-[#F5EFEB] active:bg-[#EFE6E0] transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#C25E2E]/10 text-[#C25E2E] flex items-center justify-center flex-shrink-0">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-900 block leading-tight">
              {t.calculatorTitle}
            </span>
            <span className="text-[11px] text-stone-600 block">
              {t.calculatorSubtitle}
            </span>
          </div>
        </div>

        <span className="text-[11px] font-bold text-[#9A451E] px-2 py-0.5 rounded-xs bg-white border border-[#E8C0AB] flex-shrink-0">
          {isOpen ? (language === 'id' ? 'Tutup Hitung' : 'Hide') : (language === 'id' ? 'Hitung Takaran' : 'Calculate')}
        </span>
      </button>

      {/* Expanded Calculator Form */}
      {isOpen && (
        <div className="p-3 sm:p-3.5 bg-white border-t border-stone-200 space-y-3">
          {/* Preset Multipliers */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <span className="font-semibold text-stone-700 text-[11px]">
              {t.calculatorMultiplier}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[0.5, 1, 1.5, 2, 3].map(factor => (
                <button
                  key={factor}
                  type="button"
                  onClick={() => handlePresetScale(factor)}
                  className={`px-2 py-0.5 rounded-xs text-[11px] font-bold transition-colors ${
                    inputAmount === Number((baseOriginalAmount * factor).toFixed(2))
                      ? 'bg-[#C25E2E] text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  {factor}x
                </button>
              ))}
              <button
                type="button"
                onClick={() => handlePresetScale(1)}
                className="p-1 rounded-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                title={t.calculatorReset}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Input & Unit Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                {t.calculatorInputLabel}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={inputAmount || ''}
                  onChange={e => setInputAmount(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2.5 py-1.5 text-xs font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded focus:ring-2 focus:ring-[#C25E2E] focus:bg-white text-center"
                />
                <select
                  value={selectedUnit}
                  onChange={e => setSelectedUnit(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs font-medium text-stone-800 bg-stone-50 border border-stone-300 rounded focus:ring-2 focus:ring-[#C25E2E] focus:bg-white truncate"
                >
                  {unitOptions.map((unit, idx) => (
                    <option key={idx} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculated Result Box */}
            <div className="bg-[#FAF2ED] border border-[#F0D5C7] rounded p-2 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#8C3B14] block leading-tight">
                {t.calculatorOutputLabel}
              </span>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-black text-[#662708] font-mono">
                  {calculatedSubAmount}
                </span>
                <span className="text-xs font-bold text-[#8C3B14] truncate">
                  {selectedUnit} {substitution.substituteName}
                </span>
              </div>
              {calculatedTip && (
                <span className="mt-0.5 text-[10px] text-[#A64519] font-medium block">
                  {calculatedTip}
                </span>
              )}
            </div>
          </div>

          {/* Copy calculation button */}
          <div className="pt-1 flex items-center justify-between gap-2 border-t border-stone-100">
            <span className="text-[11px] text-stone-500 italic">
              {language === 'id' 
                ? `Rasio: ${baseOriginalAmount} ${baseOriginalUnit} ≈ ${baseSubAmount} ${baseSubUnit}` 
                : `Ratio: ${baseOriginalAmount} ${baseOriginalUnit} ≈ ${baseSubAmount} ${baseSubUnit}`}
            </span>
            <button
              type="button"
              onClick={handleCopyCalculation}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-bold text-[#8C3B14] bg-[#FAF2ED] hover:bg-[#F4DFD3] border border-[#E8C0AB] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">{language === 'id' ? 'Tersalin' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-stone-600" />
                  <span>{language === 'id' ? 'Salin Hitungan' : 'Copy Ratio'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
