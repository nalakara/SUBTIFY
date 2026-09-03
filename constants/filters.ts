import { PantryFilter } from '../types';

export const PANTRY_FILTERS: PantryFilter[] = [
  {
    id: 'halal',
    labelId: 'Alternatif Halal',
    labelEn: 'Halal Alternative',
    icon: '🍃',
    promptInstructionId: 'Alternatif Halal: Pengganti tanpa alkohol, rum, mirin, sake, angciu, atau gelatin hewani non-halal.',
    promptInstructionEn: 'Halal Alternative: Exclude alcohol, cooking wine, mirin, sake, rum, or non-halal animal gelatin.',
  },
  {
    id: 'dairy_free',
    labelId: 'Bebas Susu / Laktosa',
    labelEn: 'Dairy-Free',
    icon: '🌱',
    promptInstructionId: 'Bebas Susu / Laktosa: Jangan gunakan susu sapi, mentega (butter hewani), atau produk turunan susu hewani.',
    promptInstructionEn: 'Dairy-Free: Avoid cow milk, dairy butter, cream, or dairy derivatives.',
  },
  {
    id: 'gluten_free',
    labelId: 'Bebas Gluten',
    labelEn: 'Gluten-Free',
    icon: '🌾',
    promptInstructionId: 'Bebas Gluten: Gunakan bahan bebas gandum/terigu (gunakan tapioka, beras, maizena, singkong, dll).',
    promptInstructionEn: 'Gluten-Free: Avoid wheat flour; use rice flour, tapioca, cornstarch, cassava, etc.',
  },
  {
    id: 'vegan',
    labelId: 'Berbasis Nabati / Vegan',
    labelEn: 'Plant-Based / Vegan',
    icon: '🥗',
    promptInstructionId: 'Berbasis Nabati (Vegan): Utamakan bahan nabati tanpa telur, susu hewani, madu, atau produk turunan hewani.',
    promptInstructionEn: 'Plant-Based / Vegan: Prioritize plant ingredients without dairy, eggs, honey, or animal products.',
  },
  {
    id: 'budget_local',
    labelId: 'Pasar & Warung Lokal',
    labelEn: 'Local Market & Stall',
    icon: '🏪',
    promptInstructionId: 'Utamakan bahan ekonomis yang sangat mudah ditemukan di warung kelontong, tukang sayur keliling, atau pasar tradisional.',
    promptInstructionEn: 'Prioritize inexpensive, readily available items from local neighborhood wet markets or small grocery stalls.',
  },
  {
    id: 'low_sugar',
    labelId: 'Rendah Gula',
    labelEn: 'Low Sugar',
    icon: '🍋',
    promptInstructionId: 'Rendah Gula: Hindari gula rafinasi tinggi atau pemanis berlebih.',
    promptInstructionEn: 'Low Sugar: Avoid high-refined sugar or excessive sweeteners.',
  },
];
