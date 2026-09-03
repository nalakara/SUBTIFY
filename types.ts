export type Language = 'en' | 'id';

export type PantryFilterId = 
  | 'halal'
  | 'dairy_free'
  | 'gluten_free'
  | 'vegan'
  | 'budget_local'
  | 'low_sugar';

export interface PantryFilter {
  id: PantryFilterId;
  labelId: string;
  labelEn: string;
  icon: string;
  promptInstructionId: string;
  promptInstructionEn: string;
}

export interface SubstitutionRatio {
  originalAmount: number;
  originalUnit: string;
  substituteAmount: number;
  substituteUnit: string;
  prepTip?: string;
}

export interface Substitution {
  substituteName: string;
  reasoning: {
    flavor: string;
    texture: string;
  };
  howToUse: string;
  bestFor: string;
  imageUrl: string;
  ratio?: SubstitutionRatio;
  language?: Language;
}

export interface SavedFavoriteItem {
  id: string;
  originalIngredient: string;
  substitution: Substitution;
  savedAt: number;
  language: Language;
  context?: string;
  activeFilters?: PantryFilterId[];
}
