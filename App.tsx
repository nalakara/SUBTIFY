import React, { useState, useCallback, useRef, useEffect } from 'react';
import { type Substitution, type Language, type PantryFilterId, type SavedFavoriteItem } from './types';
import { translations } from './translations';
import { findSubstitutions, identifyIngredientFromImage, interpretSubstitutionsLanguage, hasApiKey, setApiKey, getApiKey } from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { SubstitutionCard } from './components/SubstitutionCard';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { PantryFilterBar } from './components/PantryFilterBar';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { 
  Camera, 
  RotateCcw, 
  ChefHat, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  UtensilsCrossed,
  Layers,
  Bookmark,
  Search,
  Key,
  X
} from 'lucide-react';

const STORAGE_FAVORITES_KEY = 'subtify_favorites_v1';
const STORAGE_RECENT_KEY = 'subtify_recent_searches_v1';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('subtify_lang') as Language;
      return saved === 'en' || saved === 'id' ? saved : 'id';
    } catch {
      return 'id';
    }
  });

  const [ingredient, setIngredient] = useState<string>('');
  const [context, setContext] = useState<string>('');
  
  // Feature 3: Dietary & Pantry Filters
  const [selectedFilters, setSelectedFilters] = useState<PantryFilterId[]>([]);

  // Feature 4: Saved Favorites & Recent Searches
  const [favorites, setFavorites] = useState<SavedFavoriteItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_RECENT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);

  // Cache substitutions per language for instant toggle without re-fetching
  const [substitutionsByLang, setSubstitutionsByLang] = useState<Record<Language, Substitution[] | null>>({
    id: null,
    en: null,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isIdentifying, setIsIdentifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ingredientInputRef = useRef<HTMLInputElement>(null);
  
  // Mobile sheet expansion state
  const [isSheetExpanded, setIsSheetExpanded] = useState<boolean>(true);

  // API Key settings state
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(() => hasApiKey());
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>('');

  const t = translations[language];
  const currentSubstitutions = substitutionsByLang[language];

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn("Could not persist favorites to localStorage:", e);
    }
  }, [favorites]);

  // Persist recent searches
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(recentSearches));
    } catch (e) {
      console.warn("Could not persist recent searches to localStorage:", e);
    }
  }, [recentSearches]);

  // Language switch handler with contextual re-interpretation of active results
  const handleLanguageChange = async (newLang: Language) => {
    if (newLang === language) return;
    
    setLanguage(newLang);
    try {
      localStorage.setItem('subtify_lang', newLang);
    } catch {
      // storage ignore
    }

    // If there are existing substitutions, contextually translate if not already cached
    const activeSubs = substitutionsByLang[language];
    if (activeSubs && activeSubs.length > 0) {
      if (substitutionsByLang[newLang] && substitutionsByLang[newLang]!.length > 0) {
        return;
      }

      setIsTranslating(true);
      setError(null);
      try {
        const translated = await interpretSubstitutionsLanguage(activeSubs, newLang, ingredient);
        setSubstitutionsByLang(prev => ({
          ...prev,
          [newLang]: translated,
        }));
      } catch (err) {
        console.warn("Could not contextually translate substitutions:", err);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleImageRecognition = async (file: File) => {
    setIsIdentifying(true);
    setError(null);
    setSubstitutionsByLang({ en: null, id: null });
    setIngredient('');
    setIsSheetExpanded(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        if (!base64String) {
          throw new Error(t.errorInvalidImage);
        }
        const identifiedIngredient = await identifyIngredientFromImage(base64String, file.type, language);
        setIngredient(identifiedIngredient);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during image recognition.');
      } finally {
        setIsIdentifying(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
      setError(t.errorInvalidImage);
      setIsIdentifying(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(t.errorInvalidImage);
        return;
      }
      handleImageRecognition(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleToggleFilter = (filterId: PantryFilterId) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId) 
        : [...prev, filterId]
    );
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
  };

  const executeSearch = useCallback(async (searchIngredient: string, searchContext: string, filters: PantryFilterId[]) => {
    if (!searchIngredient.trim()) {
      setError(t.errorEmptyIngredient);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSubstitutionsByLang({ en: null, id: null });

    // Track in recent searches
    setRecentSearches(prev => {
      const trimmed = searchIngredient.trim();
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 10);
    });

    try {
      const results = await findSubstitutions(searchIngredient, searchContext, language, filters);
      setSubstitutionsByLang({
        [language]: results,
        [language === 'id' ? 'en' : 'id']: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [language, t]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(ingredient, context, selectedFilters);
  }, [executeSearch, ingredient, context, selectedFilters]);

  const handleNewSearch = () => {
    setSubstitutionsByLang({ en: null, id: null });
    setError(null);
    setIngredient('');
    setContext('');
    setIsSheetExpanded(true);
    setTimeout(() => ingredientInputRef.current?.focus(), 150);
  };

  const handleSelectQuickContext = (chipValue: string) => {
    if (!context) {
      setContext(chipValue);
    } else if (!context.includes(chipValue)) {
      setContext(prev => `${prev}, ${chipValue}`);
    }
  };

  // Toggle favorite for a specific substitution
  const handleToggleFavorite = (sub: Substitution) => {
    const existingIndex = favorites.findIndex(
      f => f.originalIngredient.toLowerCase() === ingredient.trim().toLowerCase() &&
           f.substitution.substituteName.toLowerCase() === sub.substituteName.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Remove from favorites
      setFavorites(prev => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      // Add to favorites
      const newFav: SavedFavoriteItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        originalIngredient: ingredient.trim(),
        substitution: sub,
        savedAt: Date.now(),
        language,
        context,
        activeFilters: selectedFilters,
      };
      setFavorites(prev => [newFav, ...prev]);
    }
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const handleClearAllFavorites = () => {
    setFavorites([]);
  };

  // Open saved favorite directly into view
  const handleSelectFavorite = (item: SavedFavoriteItem) => {
    setIngredient(item.originalIngredient);
    if (item.context) setContext(item.context);
    if (item.activeFilters) setSelectedFilters(item.activeFilters);
    
    setSubstitutionsByLang({
      [language]: [item.substitution],
      [language === 'id' ? 'en' : 'id']: null,
    });
    setIsSheetExpanded(true);
  };

  const handleSelectRecentSearch = (search: string) => {
    setIngredient(search);
    executeSearch(search, context, selectedFilters);
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
  };

  const isCurrentSubFavorite = (sub: Substitution) => {
    return favorites.some(
      f => f.originalIngredient.toLowerCase() === ingredient.trim().toLowerCase() &&
           f.substitution.substituteName.toLowerCase() === sub.substituteName.toLowerCase()
    );
  };

  const anyLoading = isLoading || isIdentifying || isTranslating;

  return (
    <div className="bg-brand-bg h-[100dvh] w-screen overflow-hidden font-sans text-brand-text relative select-none">
      {/* Background Image with culinary ambiance */}
      <img 
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" 
        alt="Culinary background" 
        className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-90 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/70 z-10 pointer-events-none" />

      {/* Top Header Bar - Minimal & Mobile-Friendly */}
      <header className="absolute top-0 left-0 right-0 z-20 px-3.5 sm:px-5 py-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#C25E2E] text-white flex items-center justify-center shadow-xs">
            <UtensilsCrossed className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide drop-shadow-sm">
              SUBTIFY
            </span>
          </div>
        </div>

        {/* Right header controls: Favorites bookmark + simple ID | EN switcher */}
        <div className="flex items-center gap-2">
          {/* API Key Modal Trigger */}
          <button
            type="button"
            onClick={() => {
              setTempApiKey(getApiKey());
              setIsKeyModalOpen(true);
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-bold transition-colors shadow-xs min-h-[32px] ${
              isApiKeySet 
                ? 'bg-stone-900/60 hover:bg-stone-900/80 border-white/20 text-white' 
                : 'bg-[#C25E2E] hover:bg-[#A94B20] border-amber-300 text-white shadow-md'
            }`}
            title={isApiKeySet ? (language === 'id' ? 'Kunci API Gemini Aktif' : 'Gemini API Key Active') : (language === 'id' ? 'Atur API Key Gemini' : 'Set Gemini API Key')}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">API Key</span>
            <span className={`w-2 h-2 rounded-full ${isApiKeySet ? 'bg-emerald-400' : 'bg-amber-300 animate-ping'}`} />
          </button>

          <button
            type="button"
            id="open-favorites-button"
            onClick={() => setIsFavoritesOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-stone-900/60 hover:bg-stone-900/80 border border-white/20 text-xs font-bold text-white transition-colors shadow-xs min-h-[32px]"
            title={t.savedTitle}
            aria-label={t.savedTitle}
          >
            <Bookmark className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'fill-[#E07A4B] text-[#E07A4B]' : 'text-stone-200'}`} />
            {favorites.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#C25E2E] text-white text-[10px] font-bold rounded-xs leading-tight">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Minimal ID | EN Toggle Button */}
          <LanguageSwitcher 
            language={language} 
            onLanguageChange={handleLanguageChange}
            isTranslating={isTranslating}
          />
        </div>
      </header>

      {/* Bottom Sheet Modal Container - Responsive for all mobile screens */}
      <main 
        className={`absolute left-0 right-0 z-30 transition-all duration-300 ease-out ${
          isSheetExpanded 
            ? 'top-[60px] sm:top-[70px] md:top-[80px]' 
            : 'top-[calc(100dvh-135px)] sm:top-[calc(100dvh-150px)]'
        } bottom-0 max-w-3xl mx-auto`}
      >
        <div className="bg-white h-full rounded-t-lg shadow-xl flex flex-col relative overflow-hidden border-t border-stone-200">
          
          {/* Sheet Grabber / Header Handle */}
          <div 
            id="sheet-grabber"
            onClick={() => setIsSheetExpanded(prev => !prev)} 
            className="w-full pt-3 pb-2 px-4 flex flex-col items-center justify-center cursor-pointer flex-shrink-0 hover:bg-stone-50 active:bg-stone-100 transition-colors" 
            aria-label={isSheetExpanded ? "Collapse panel" : "Expand panel"}
          >
            <div className="w-10 h-1 bg-stone-300 hover:bg-[#C25E2E] rounded-sm transition-colors mb-1.5" />
            <div className="w-full flex items-center justify-between text-xs text-stone-600 px-2">
              <span className="text-[11px] font-bold text-[#8C3B14] uppercase tracking-wider flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-[#C25E2E]" />
                <span>{language === 'id' ? 'Asisten Bahan Dapur' : 'Pantry Assistant'}</span>
              </span>
              <span className="text-[11px] text-stone-500 font-medium flex items-center gap-0.5">
                {isSheetExpanded ? (
                  <>
                    <span>{language === 'id' ? 'Tutup' : 'Collapse'}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>{language === 'id' ? 'Buka' : 'Expand'}</span>
                    <ChevronUp className="w-3.5 h-3.5 text-[#C25E2E]" />
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Subheader bar when sheet is expanded */}
          {isSheetExpanded && (
            <div className="px-4 sm:px-6 py-1.5 bg-[#FAF7F4] border-b border-stone-200 flex items-center justify-between text-[11px] sm:text-xs text-stone-800 flex-shrink-0">
              <div className="flex items-center gap-1.5 truncate mr-2">
                <ChefHat className="w-3.5 h-3.5 text-[#C25E2E] flex-shrink-0" />
                <span className="font-semibold truncate">
                  {language === 'id' 
                    ? 'Kamus Pengganti Bahan & Takaran Lokal' 
                    : 'Local Cooking Substitutes & Kitchen Ratios'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedFilters.length > 0 && (
                  <span className="px-2 py-0.5 bg-[#FAF2ED] text-[#8C3B14] rounded-xs text-[10px] font-bold border border-[#F2D7C9]">
                    {selectedFilters.length} filter
                  </span>
                )}
                <span className="font-bold text-[#8C3B14] px-1.5 py-0.5 bg-[#FAF2ED] rounded-xs text-[10px]">
                  {language.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Scrollable Content Container */}
          <div className="flex-grow overflow-y-auto px-4 sm:px-6 pt-3 pb-32">
            {!isSheetExpanded ? (
              /* Collapsed peek state on mobile */
              <div 
                id="collapsed-sheet-trigger"
                className="text-center py-2 cursor-pointer" 
                onClick={() => setIsSheetExpanded(true)}
              >
                <div className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3.5 bg-[#C25E2E] text-white rounded-md font-medium shadow-xs hover:bg-[#A94B20] active:scale-[0.99] transition-all text-xs sm:text-sm">
                  <ChefHat className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="whitespace-nowrap truncate">{t.collapsedPrompt}</span>
                  <ChevronUp className="w-3.5 h-3.5 flex-shrink-0 ml-0.5" />
                </div>
              </div>
            ) : (
              <>
                {/* Loading state indicator */}
                {anyLoading ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 sm:py-16 px-3 text-stone-600">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-[#FAF2ED] flex items-center justify-center mb-3 sm:mb-4 border border-[#F2D7C9]">
                      <LoadingSpinner className="h-7 w-7 sm:h-8 sm:w-8 text-[#C25E2E]" />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg font-serif text-stone-900">
                      {isIdentifying 
                        ? t.loadingIdentifying.title 
                        : isTranslating 
                        ? t.loadingTranslating.title 
                        : t.loadingSubstitutions.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-sm leading-relaxed">
                      {isIdentifying 
                        ? t.loadingIdentifying.subtitle 
                        : isTranslating 
                        ? t.loadingTranslating.subtitle 
                        : t.loadingSubstitutions.subtitle}
                    </p>
                    <span className="mt-2.5 text-[11px] font-semibold text-[#8C3B14] bg-[#FAF2ED] px-2 py-0.5 rounded-xs border border-[#F2D7C9]">
                      {t.waitMoment}
                    </span>
                  </div>
                ) : error ? (
                  <div className="py-4">
                    <ErrorMessage message={error} />
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#9A451E] hover:text-[#C25E2E]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{language === 'id' ? 'Tutup pesan & ulangi' : 'Dismiss & retry'}</span>
                    </button>
                  </div>
                ) : currentSubstitutions ? (
                  /* Substitutions Result List */
                  <div className="space-y-4 sm:space-y-5">
                    <div className="text-center pt-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FAF2ED] text-[#8C3B14] rounded-xs text-[11px] font-bold mb-1 border border-[#F2D7C9]">
                        <ChefHat className="w-3.5 h-3.5 text-[#C25E2E]" />
                        <span>{t.interpretBadge}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-tight">
                        {t.resultsHeading}
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                        {t.resultsSubtitle(currentSubstitutions.length, ingredient)}
                      </p>
                    </div>

                    {/* Active filters reminder badge */}
                    {selectedFilters.length > 0 && (
                      <div className="flex items-center justify-center gap-1.5 flex-wrap text-xs">
                        <span className="text-[11px] font-bold text-stone-600">{t.filtersAppliedLabel}</span>
                        {selectedFilters.map(fId => (
                          <span key={fId} className="px-2 py-0.5 bg-[#FAF2ED] text-[#8C3B14] rounded-xs text-[10px] font-semibold border border-[#F0D5C7]">
                            {fId.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick switch language tip in result */}
                    <div className="p-2.5 sm:p-3 bg-[#FAF7F4] rounded-md border border-stone-200 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-stone-800 text-[11px] sm:text-xs">
                        <Layers className="w-3.5 h-3.5 text-[#C25E2E] flex-shrink-0" />
                        <span>
                          {language === 'id' 
                            ? 'Istilah disesuaikan untuk dapur Indonesia.' 
                            : 'Interpreted for local culinary context.'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLanguageChange(language === 'id' ? 'en' : 'id')}
                        disabled={isTranslating}
                        className="font-bold text-[#8C3B14] hover:text-[#C25E2E] underline text-[11px] flex-shrink-0"
                      >
                        {language === 'id' ? 'Versi EN' : 'ID Version'}
                      </button>
                    </div>

                    {currentSubstitutions.length > 0 ? (
                      <div className="space-y-4">
                        {currentSubstitutions.map((sub, index) => (
                          <SubstitutionCard 
                            key={`${sub.substituteName}-${index}`} 
                            substitution={sub} 
                            language={language}
                            originalIngredient={ingredient}
                            isFavorite={isCurrentSubFavorite(sub)}
                            onToggleFavorite={() => handleToggleFavorite(sub)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-6 bg-stone-50 rounded-md border border-dashed border-stone-300">
                        <ChefHat className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                        <p className="text-stone-600 text-sm font-medium">
                          {t.noResults(ingredient)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Search Form View */
                  <form id="substitute-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 pt-1">
                    {!isApiKeySet && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2.5 text-xs text-amber-900 shadow-xs">
                        <Key className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-stone-900">
                            {language === 'id' ? 'Kunci API Gemini Belum Disetel' : 'Gemini API Key Required'}
                          </p>
                          <p className="text-stone-600 mt-0.5 leading-relaxed text-[11px]">
                            {language === 'id'
                              ? 'Fitur pencarian bahan AI & foto membutuhkan Google Gemini API Key. Klik tombol di bawah atau atur di file .env.'
                              : 'AI substitutions and photo scanning require a Google Gemini API Key. Click below or configure in your .env file.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setTempApiKey(getApiKey());
                              setIsKeyModalOpen(true);
                            }}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#C25E2E] hover:bg-[#A94B20] text-white font-bold rounded text-[11px] transition-colors shadow-xs"
                          >
                            <Key className="w-3 h-3" />
                            <span>{language === 'id' ? 'Masukkan API Key' : 'Configure API Key'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-3">
                      <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-snug">
                        {t.formHeading}
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-md mx-auto leading-relaxed">
                        {t.formSubheading}
                      </p>
                    </div>

                    {/* Ingredient Input Field with Photo Scanner Button */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="ingredient-input" className="block text-xs sm:text-sm font-bold text-stone-900">
                          {t.ingredientLabel}
                        </label>
                        <button
                          id="upload-camera-button"
                          type="button"
                          onClick={triggerFileSelect}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF2ED] text-[#8C3B14] hover:bg-[#F4DFD3] border border-[#E8C0AB] text-xs font-semibold transition-colors min-h-[34px] disabled:opacity-50"
                          title={t.cameraTooltip}
                          aria-label={t.cameraTooltip}
                          disabled={anyLoading}
                        >
                          <Camera className="h-3.5 w-3.5 text-[#C25E2E]" />
                          <span>{language === 'id' ? 'Foto Bahan' : 'Scan'}</span>
                        </button>
                        <input 
                          id="file-input-element"
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleImageChange} 
                          className="hidden" 
                          accept="image/png, image/jpeg, image/webp" 
                          disabled={anyLoading} 
                        />
                      </div>

                      <div className="relative">
                        <input 
                          ref={ingredientInputRef}
                          id="ingredient-input" 
                          type="text" 
                          value={ingredient} 
                          onChange={(e) => setIngredient(e.target.value)} 
                          placeholder={t.ingredientPlaceholder} 
                          className="w-full px-3.5 py-2.5 sm:py-3 bg-stone-50 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#C25E2E] focus:border-[#C25E2E] focus:bg-white transition-all placeholder:text-stone-400 text-sm sm:text-base font-medium text-stone-900 shadow-2xs min-h-[44px]" 
                          disabled={anyLoading} 
                        />
                      </div>
                    </div>

                    {/* Feature 3: Dietary & Pantry Filters */}
                    <div className="pt-0.5">
                      <PantryFilterBar 
                        selectedFilters={selectedFilters}
                        onToggleFilter={handleToggleFilter}
                        onClearFilters={handleClearFilters}
                        language={language}
                        disabled={anyLoading}
                      />
                    </div>

                    {/* Recipe Context Field */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="context-input" className="block text-xs sm:text-sm font-bold text-stone-900">
                          {t.contextLabel}{' '}
                          <span className="text-[11px] font-normal text-stone-500">{t.contextOptional}</span>
                        </label>
                      </div>
                      <textarea 
                        id="context-input" 
                        value={context} 
                        onChange={(e) => setContext(e.target.value)} 
                        placeholder={t.contextPlaceholder} 
                        rows={2} 
                        className="w-full px-3.5 py-2 sm:py-2.5 bg-stone-50 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#C25E2E] focus:border-[#C25E2E] focus:bg-white transition-all placeholder:text-stone-400 text-sm font-medium text-stone-900 shadow-2xs" 
                        disabled={anyLoading}
                      />

                      {/* Quick Context Suggestion Chips */}
                      <div className="mt-2.5">
                        <p className="text-[11px] font-bold text-stone-600 mb-1.5 uppercase tracking-wider">
                          {t.quickContextHeading}
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {t.quickContextChips.map((chip, idx) => (
                            <button
                              key={`chip-${idx}`}
                              type="button"
                              onClick={() => handleSelectQuickContext(chip.value)}
                              disabled={anyLoading}
                              className="px-2.5 py-1.5 rounded text-xs font-medium bg-stone-100 hover:bg-[#FAF2ED] text-stone-800 hover:text-[#8C3B14] border border-stone-200 hover:border-[#E8C0AB] transition-colors min-h-[32px] text-left active:scale-[0.98]"
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
          
          {/* Action Button Bar Fixed at Bottom - Thumb friendly on mobile */}
          {isSheetExpanded && !anyLoading && (
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-white border-t border-stone-200 shadow-md z-20">
              {currentSubstitutions ? (
                <button 
                  id="new-search-button"
                  onClick={handleNewSearch} 
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-900 text-white font-bold rounded-md shadow-sm hover:bg-black active:scale-[0.99] transition-all text-sm min-h-[46px]"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{t.newSearchButton}</span>
                </button>
              ) : (
                <button 
                  id="find-substitutes-submit-button"
                  type="submit" 
                  form="substitute-form" 
                  disabled={!ingredient.trim()} 
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#C25E2E] text-white font-bold rounded-md shadow-sm hover:bg-[#A94B20] active:scale-[0.99] transition-all disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed disabled:scale-100 text-sm font-sans min-h-[46px]"
                >
                  <Search className="h-4 w-4" />
                  <span>{t.findButton}</span>
                  <ArrowRight className="h-4 w-4 ml-0.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Feature 4: Favorites & History Drawer */}
      <FavoritesDrawer 
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={handleRemoveFavorite}
        onClearAllFavorites={handleClearAllFavorites}
        onSelectFavorite={handleSelectFavorite}
        recentSearches={recentSearches}
        onSelectRecentSearch={handleSelectRecentSearch}
        onClearRecentSearches={handleClearRecentSearches}
        language={language}
      />

      {/* API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-[#FAF2ED] text-[#C25E2E] flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  {language === 'id' ? 'Pengaturan Kunci API Gemini' : 'Gemini API Key Settings'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-stone-600 leading-relaxed">
              {language === 'id'
                ? 'Aplikasi membutuhkan Google Gemini API Key untuk mencari bahan pengganti dan menganalisis foto. Kunci disimpan di browser Anda atau bisa diatur di file .env (GEMINI_API_KEY).'
                : 'The application requires a Google Gemini API Key for culinary substitutions and photo recognition. Stored in your local browser or configure via .env (GEMINI_API_KEY).'}
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Gemini API Key
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C25E2E] focus:border-[#C25E2E] font-mono text-stone-900"
              />
              <p className="mt-1.5 text-[11px] text-stone-500">
                {language === 'id' ? 'Dapatkan gratis di ' : 'Get a free key at '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#C25E2E] underline hover:text-[#9A451E] font-medium"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setApiKey(tempApiKey);
                  setIsApiKeySet(Boolean(tempApiKey.trim()));
                  setIsKeyModalOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-[#C25E2E] hover:bg-[#A94B20] text-white rounded-md transition-colors shadow-xs"
              >
                {language === 'id' ? 'Simpan Kunci' : 'Save Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
