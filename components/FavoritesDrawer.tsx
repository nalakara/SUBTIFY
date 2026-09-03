import React, { useState, useEffect } from 'react';
import { type SavedFavoriteItem, type Language } from '../types';
import { translations } from '../translations';
import { Bookmark, Trash2, X, Clock, Copy, Check, ChefHat, ExternalLink } from 'lucide-react';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: SavedFavoriteItem[];
  onRemoveFavorite: (id: string) => void;
  onClearAllFavorites: () => void;
  onSelectFavorite: (item: SavedFavoriteItem) => void;
  recentSearches: string[];
  onSelectRecentSearch: (search: string) => void;
  onClearRecentSearches: () => void;
  language: Language;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onClearAllFavorites,
  onSelectFavorite,
  recentSearches,
  onSelectRecentSearch,
  onClearRecentSearches,
  language,
}) => {
  const t = translations[language];
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  // Hard Gate R-32: Keyboard accessibility (Escape key handler)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async (item: SavedFavoriteItem) => {
    const text = language === 'id'
      ? `Resep Pengganti SUBTIFY:\nBahan Asli: ${item.originalIngredient}\nPengganti: ${item.substitution.substituteName} (Pas untuk: ${item.substitution.bestFor})\nTakaran: ${item.substitution.howToUse}`
      : `SUBTIFY Substitute Note:\nOriginal: ${item.originalIngredient}\nSubstitute: ${item.substitution.substituteName} (Best for: ${item.substitution.bestFor})\nProportions: ${item.substitution.howToUse}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 transition-opacity duration-150"
      onClick={onClose}
    >
      {/* Drawer content */}
      <div 
        className="w-full max-w-md bg-white h-full shadow-xl flex flex-col overflow-hidden border-l border-stone-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="favorites-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-stone-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#FAF2ED] text-[#C25E2E] flex items-center justify-center border border-[#F2D7C9]">
              <Bookmark className="w-4 h-4 fill-[#C25E2E] text-[#C25E2E]" />
            </div>
            <div>
              <h2 id="favorites-drawer-title" className="text-base font-bold font-serif text-stone-900 leading-tight">
                {t.savedTitle}
              </h2>
              <p className="text-[11px] font-medium text-stone-600">
                {t.savedCount(favorites.length)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            aria-label={t.closeDrawer}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2 gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'border-[#C25E2E] text-[#9A451E]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Favorit' : 'Favorites'} ({favorites.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-[#C25E2E] text-[#9A451E]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Riwayat' : 'Recent'} ({recentSearches.length})</span>
          </button>
        </div>

        {/* Tab content area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'favorites' ? (
            favorites.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-md bg-[#FAF2ED] text-[#C25E2E] flex items-center justify-center mx-auto mb-3 border border-[#F2D7C9]">
                  <Bookmark className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900 text-sm">
                  {language === 'id' ? 'Belum Ada Favorit' : 'No Favorites Saved'}
                </h3>
                <p className="mt-1 text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                  {t.noFavoritesYet}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    {language === 'id' ? 'Daftar Resep Tersimpan' : 'Saved List'}
                  </span>
                  <button
                    type="button"
                    onClick={onClearAllFavorites}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold"
                  >
                    {t.clearAllSaved}
                  </button>
                </div>

                {favorites.map((fav) => (
                  <div 
                    key={fav.id}
                    className="bg-white rounded-md p-3.5 border border-stone-200 shadow-xs hover:border-[#E8C0AB] transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-[#8C3B14] uppercase bg-[#FAF2ED] px-2 py-0.5 rounded-xs border border-[#F0D5C7]">
                            {fav.originalIngredient}
                          </span>
                          <span className="text-[10px] text-stone-600 font-medium">
                            {new Date(fav.savedAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <h4 className="mt-1.5 text-sm font-bold text-stone-900 truncate">
                          {fav.substitution.substituteName}
                        </h4>
                        <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-relaxed">
                          {fav.substitution.howToUse}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveFavorite(fav.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        title={t.removeFromFavorites}
                        aria-label={t.removeFromFavorites}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleCopy(fav)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-[#C25E2E]"
                      >
                        {copiedId === fav.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">{language === 'id' ? 'Tersalin' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{language === 'id' ? 'Salin' : 'Copy'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectFavorite(fav);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#C25E2E] hover:bg-[#A94B20] text-white rounded font-bold text-[11px] shadow-xs"
                      >
                        <span>{t.openSubstitute}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )
          ) : (
            /* Recent searches tab */
            recentSearches.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-stone-600">
                  {language === 'id' ? 'Belum ada riwayat pencarian.' : 'No recent searches recorded.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    {t.recentSearchesTitle}
                  </span>
                  <button
                    type="button"
                    onClick={onClearRecentSearches}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold"
                  >
                    {t.clearAllSaved}
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  {recentSearches.map((search, idx) => (
                    <button
                      key={`${search}-${idx}`}
                      type="button"
                      onClick={() => {
                        onSelectRecentSearch(search);
                        onClose();
                      }}
                      className="w-full px-3 py-2 rounded-md bg-white hover:bg-[#FAF2ED] border border-stone-200 hover:border-[#E8C0AB] text-left text-xs font-semibold text-stone-800 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ChefHat className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#C25E2E] flex-shrink-0" />
                        <span className="truncate">{search}</span>
                      </div>
                      <span className="text-[10px] text-[#C25E2E] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {language === 'id' ? 'Cari Ulang' : 'Search Again'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center flex-shrink-0">
          <p className="text-[11px] text-stone-600">
            {language === 'id' 
              ? 'Tersimpan di peramban lokal (bisa diakses offline)' 
              : 'Saved in local storage for offline kitchen reference'}
          </p>
        </div>
      </div>
    </div>
  );
};
