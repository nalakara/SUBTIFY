import { Language } from './types';

export interface QuickContextChip {
  label: string;
  value: string;
}

export const translations = {
  en: {
    appTitle: 'SUBTIFY',
    tagline: 'Cook Globally, Shop Locally',
    collapsedPrompt: 'Tap to find local ingredient substitutes',
    heroBadge: 'Local Kitchen & Pantry Guide',
    formHeading: 'Find an Ingredient Substitute',
    formSubheading: 'Practical local ingredients with culinary notes, flavor balance, and kitchen-tested proportions.',
    ingredientLabel: 'Ingredient to Replace',
    ingredientPlaceholder: 'e.g., Buttermilk, Mirin, Crème Fraîche, or snap a photo',
    cameraTooltip: 'Upload or take a photo of an ingredient',
    contextLabel: 'Recipe Context & Notes',
    contextOptional: '(optional)',
    contextPlaceholder: 'e.g., For chocolate chiffon cake, savory stew, or dairy-free baking',
    
    // Pantry Filters
    pantryFiltersHeading: 'Dietary & Pantry Filters',
    pantryFiltersSub: 'Tailor alternatives for your dietary and grocery needs',
    filtersAppliedLabel: 'Active Filters:',
    clearFilters: 'Reset filters',

    // Quick Context
    quickContextHeading: 'Quick recipe contexts:',
    quickContextChips: [
      { label: '🍰 Baking & Pastry', value: 'Baking cakes or pastries; need moisture, rise, and delicate crumb' },
      { label: '🌱 Plant-Based / Dairy-Free', value: 'Plant-based recipe; no dairy or animal products' },
      { label: '🥘 Savory & Stews', value: 'Savory stew, rich sauce, or braised dish' },
      { label: '🍃 Halal Alternative', value: 'Non-alcoholic cooking substitute without rum, mirin, or animal gelatin' },
    ] as QuickContextChip[],
    findButton: 'Find Substitutes',
    newSearchButton: 'Start New Search',
    resultsHeading: 'Suggested Substitutions',
    resultsSubtitle: (count: number, ingredient: string) =>
      `${count} curated local alternative${count === 1 ? '' : 's'} for "${ingredient}"`,
    bestForLabel: 'Best for',
    howToUseLabel: 'How to Use & Proportions',
    flavorLabel: 'Flavor Profile',
    textureLabel: 'Texture & Consistency',
    noResults: (ingredient: string) =>
      `No suitable substitutions found for "${ingredient}". Try adjusting dietary filters or clarifying the recipe style.`,
    errorEmptyIngredient: 'Please enter an ingredient to substitute.',
    errorInvalidImage: 'Please select a valid image file (PNG, JPEG, or WebP).',
    loadingIdentifying: {
      title: 'Identifying Ingredient...',
      subtitle: 'Analyzing ingredient photo from recipe...',
    },
    loadingSubstitutions: {
      title: 'Finding Best Substitutes...',
      subtitle: 'Matching local market ingredients and balance of flavors...',
    },
    loadingTranslating: {
      title: 'Preparing Culinary Guide...',
      subtitle: 'Refining culinary terminology and flavor notes...',
    },
    waitMoment: 'This may take a moment.',
    languageToggleLabel: 'Language',
    interpretBadge: 'Local Kitchen Notes',
    switchLanguagePrompt: 'Switch language to Indonesian for local culinary terms',

    // Ratio Calculator
    calculatorTitle: 'Recipe Ratio Calculator',
    calculatorSubtitle: 'Scale proportions based on your recipe needs',
    calculatorInputLabel: 'Original recipe calls for:',
    calculatorOutputLabel: 'Use this substitute amount:',
    calculatorMultiplier: 'Scale:',
    calculatorReset: 'Reset 1x',

    // Favorites & History
    savedTitle: 'Saved Substitutes & History',
    savedSubtitle: 'Pantry alternatives saved for your next market trip',
    savedCount: (count: number) => `${count} saved`,
    saveToFavorites: 'Save to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    noFavoritesYet: 'No saved substitutions yet. Tap the bookmark icon on any card to save it for quick reference!',
    recentSearchesTitle: 'Recent Searches',
    clearAllSaved: 'Clear all',
    copySaved: 'Copy substitute notes',
    openSubstitute: 'View Details',
    closeDrawer: 'Close',
  },
  id: {
    appTitle: 'SUBTIFY',
    tagline: 'Masak Menu Dunia, Belanja Bumbu Tetangga',
    collapsedPrompt: 'Ketuk untuk cari bahan pengganti lokal',
    heroBadge: 'Panduan Bumbu & Dapur Lokal',
    formHeading: 'Cari Alternatif Bahan Makanan',
    formSubheading: 'Temukan bahan pengganti lokal yang mudah didapat, lengkap dengan takaran resep dan karakter rasa.',
    ingredientLabel: 'Bahan yang Ingin Diganti',
    ingredientPlaceholder: 'misal: Buttermilk, Mirin, Crème Fraîche, atau foto bahannya',
    cameraTooltip: 'Unggah atau foto bumbu/bahan masakan',
    contextLabel: 'Konteks Resep & Kebutuhan Khusus',
    contextOptional: '(opsional)',
    contextPlaceholder: 'misal: Untuk bolu chiffon cokelat, kuah gulai gurih, atau bebas susu',
    
    // Pantry Filters
    pantryFiltersHeading: 'Filter Pantangan & Belanja',
    pantryFiltersSub: 'Saring bahan pengganti sesuai diet, kehalalan, atau bahan warung',
    filtersAppliedLabel: 'Filter Aktif:',
    clearFilters: 'Reset filter',

    // Quick Context
    quickContextHeading: 'Pilihan konteks masakan:',
    quickContextChips: [
      { label: '🍰 Aneka Kue & Bolu', value: 'Untuk adonan kue/bolu panggang; butuh kelembapan dan tekstur empuk' },
      { label: '🌱 Bebas Susu / Nabati', value: 'Bahan nabati tanpa susu hewani atau laktosa' },
      { label: '🥘 Masakan Gurih & Kuah', value: 'Untuk olahan gurih, saus kental, tumisan, atau kuah santan/sup' },
      { label: '🍃 Alternatif Halal', value: 'Pengganti masakan tanpa alkohol/rum/mirin/angciu atau gelatin non-halal' },
    ] as QuickContextChip[],
    findButton: 'Cari Bahan Pengganti',
    newSearchButton: 'Cari Bahan Lain',
    resultsHeading: 'Rekomendasi Bahan Pengganti',
    resultsSubtitle: (count: number, ingredient: string) =>
      `${count} alternatif bahan lokal untuk "${ingredient}"`,
    bestForLabel: 'Paling Pas Untuk',
    howToUseLabel: 'Takaran & Cara Pakai',
    flavorLabel: 'Karakter Rasa',
    textureLabel: 'Tekstur & Konsistensi',
    noResults: (ingredient: string) =>
      `Belum menemukan bahan pengganti yang pas untuk "${ingredient}". Coba sesuaikan filter pantangan atau perjelas konteks masakan.`,
    errorEmptyIngredient: 'Silakan ketik nama bahan yang ingin dicari penggantinya.',
    errorInvalidImage: 'Silakan pilih berkas gambar yang sesuai (PNG, JPEG, atau WebP).',
    loadingIdentifying: {
      title: 'Mengidentifikasi Bahan...',
      subtitle: 'Menganalisis foto bumbu dan bahan dapur...',
    },
    loadingSubstitutions: {
      title: 'Mencari Bahan Pengganti...',
      subtitle: 'Memilih bahan lokal dapur nusantara dengan karakter rasa seimbang...',
    },
    loadingTranslating: {
      title: 'Menyiapkan Catatan Resep...',
      subtitle: 'Menyesuaikan takaran dan istilah dapur lokal...',
    },
    waitMoment: 'Sedang diproses, mohon tunggu sebentar.',
    languageToggleLabel: 'Bahasa',
    interpretBadge: 'Catatan Bumbu Lokal',
    switchLanguagePrompt: 'Ganti ke Bahasa Inggris untuk melihat istilah kuliner internasional',

    // Ratio Calculator
    calculatorTitle: 'Kalkulator Konversi Takaran Resep',
    calculatorSubtitle: 'Hitung takaran pengganti otomatis sesuai resep Anda',
    calculatorInputLabel: 'Takaran bahan asli di resepmu:',
    calculatorOutputLabel: 'Gunakan bahan pengganti sebanyak:',
    calculatorMultiplier: 'Porsi / Skala:',
    calculatorReset: 'Reset 1x',

    // Favorites & History
    savedTitle: 'Bahan Tersimpan & Riwayat',
    savedSubtitle: 'Catatan bahan pengganti favorit untuk belanja dapur',
    savedCount: (count: number) => `${count} tersimpan`,
    saveToFavorites: 'Simpan ke Favorit',
    removeFromFavorites: 'Hapus dari Favorit',
    noFavoritesYet: 'Belum ada resep pengganti yang disimpan. Tekan ikon bookmark di kartu untuk menyimpannya ke daftar belanja dapur!',
    recentSearchesTitle: 'Pencarian Terakhir',
    clearAllSaved: 'Bersihkan semua',
    copySaved: 'Salin catatan pengganti',
    openSubstitute: 'Lihat Detail',
    closeDrawer: 'Tutup',
  },
};
