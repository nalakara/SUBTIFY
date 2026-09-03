import { GoogleGenAI, Type } from "@google/genai";
import { type Substitution, type Language, type PantryFilterId } from '../types';
import { PANTRY_FILTERS } from '../constants/filters';

export const getApiKey = (): string => {
  const envKey = (typeof process !== 'undefined' && (process.env?.API_KEY || process.env?.GEMINI_API_KEY)) || '';
  if (envKey) return envKey;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('subtify_gemini_api_key') || '';
  }
  return '';
};

export const hasApiKey = (): boolean => Boolean(getApiKey());

export const setApiKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('subtify_gemini_api_key', key.trim());
  }
};

const getAI = (): GoogleGenAI => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key Gemini belum disetel. Tambahkan GEMINI_API_KEY di file .env atau atur kunci API.");
  }
  return new GoogleGenAI({ apiKey });
};

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      substituteName: {
        type: Type.STRING,
        description: "Name of the substitute ingredient. Be specific and localize if applicable (e.g., 'Santan Encer + Air Jeruk Nipis' or 'Coconut Cream')."
      },
      reasoning: {
        type: Type.OBJECT,
        properties: {
          flavor: {
            type: Type.STRING,
            description: "Detailed contextual explanation of the flavor profile compared to original ingredient."
          },
          texture: {
            type: Type.STRING,
            description: "Detailed contextual explanation of texture, moisture, structure, or mouthfeel in the dish."
          },
        },
        required: ['flavor', 'texture']
      },
      howToUse: {
        type: Type.STRING,
        description: "Practical culinary ratio and step-by-step preparation instructions."
      },
      bestFor: {
        type: Type.STRING,
        description: "Specific culinary dishes, cooking methods, or recipes where this substitute excels."
      },
      ratio: {
        type: Type.OBJECT,
        description: "Structured conversion ratio for scaling recipes",
        properties: {
          originalAmount: {
            type: Type.NUMBER,
            description: "Reference base quantity of original ingredient (e.g., 1)"
          },
          originalUnit: {
            type: Type.STRING,
            description: "Unit of original ingredient (e.g., 'cup', 'sdm / tbsp', 'ml', 'gram')"
          },
          substituteAmount: {
            type: Type.NUMBER,
            description: "Equivalent calculated quantity of the primary substitute (e.g., 1 or 0.75)"
          },
          substituteUnit: {
            type: Type.STRING,
            description: "Unit of substitute ingredient"
          },
          prepTip: {
            type: Type.STRING,
            description: "Short secondary additive if needed (e.g. '+ 1 sdm perasan jeruk nipis' or 'campur air 1:1')"
          }
        },
        required: ['originalAmount', 'originalUnit', 'substituteAmount', 'substituteUnit']
      }
    },
    required: ['substituteName', 'reasoning', 'howToUse', 'bestFor']
  }
};

const getSystemInstruction = (language: Language): string => {
  if (language === 'id') {
    return `Kamu adalah pakar kuliner dan bumbu dapur profesional Indonesia serta Asia Tenggara. Tugasmu adalah memberikan alternatif bahan pengganti (substitusi) lokal yang praktis, mudah dibeli di pasar tradisional, warung, ataupun supermarket lokal di Indonesia.

PANDUAN UTAMA TENTANG GAYA BAHASA & INTERPRETASI KONTEKSTUAL (SANGAT PENTING):
1. **Bukan Penerjemahan Harfiah (Direct Translation):** DILARANG KERAS menerjemahkan istilah secara kaku kata-demi-kata (misalnya 'buttermilk' diterjemahkan jadi 'susu mentega' itu salah dan tidak ada di dapur). Lakukan interpretasi kuliner berdasarkan fungsi kimiawi/biokimia bahan dalam masakan (keasaman, lemak, emulsifier, kelembapan).
2. **Gaya Bahasa Kuliner Nusantara:** Gunakan bahasa Indonesia kuliner yang luwes, akrab, alami, dan informatif layaknya chef atau praktisi kuliner berpengalaman.
3. **Karakter Rasa & Tekstur:** Gunakan kosakata rasa yang akrab di lidah orang Indonesia (misalnya: gurih legit, asam segar, pedas hangat, umami, manis legit, aromatik) serta tekstur yang tepat (empuk bersarang, renyah/krispi, kental lembut, berpori).
4. **Takaran & Rasio Praktis:** Berikan takaran yang jelas dan mudah diukur (misal: 'Perbandingan 1:1. Campurkan 200ml susu/santan cair dengan 1 sdm perasan jeruk nipis atau cuka putih, diamkan 5-10 menit hingga mengental'). Wajib sediakan data 'ratio' terstruktur agar kalkulator takaran dapat menghitung rasio porsi resep secara otomatis.
5. **Kepekaan Konteks & Alternatif Halal:** Jika bahan aslinya berbahan non-halal (seperti mirin, shaoxing wine, rum, gelatin babi), tawarkan substitusi halal yang aman dan lezat (misal: jus anggur putih + perasan lemon untuk mirin, agar-agar rumput laut untuk gelatin).
6. **Prioritaskan Bahan Lokal:** Utamakan bahan yang melimpah di nusantara (santan, kelapa parut, lengkuas, kemiri, asam jawa, gula aren, tepung tapioka/maizena, daun pandan, dll.).
7. **Output JSON:** Wajib mengembalikan JSON murni sesuai schema yang ditentukan.`;
  }

  return `You are a world-class culinary assistant AI specializing in ingredient substitutions with an emphasis on Southeast Asian ingredients and accessible local pantry staples.

CRITICAL TONE & CONTEXTUAL INTERPRETATION RULES:
1. **Never use rigid, literal word-for-word translation.** Adapt culinary concepts based on the ingredient's actual culinary and chemical function (fat content, acidity, leavening, emulsification, moisture).
2. **Culinary Voice & Style:** Write with an inviting, practical, and engaging culinary tone suitable for passionate home cooks.
3. **Sensory Precision:** Describe flavor notes (e.g., tangy, rich nutty undertones, floral acidity) and textural dynamics (e.g., crumb structure, velvet mouthfeel, crispy caramelization).
4. **Clear Proportions & Technique:** Provide exact conversion ratios (e.g., '1:1 ratio. For 1 cup of buttermilk, mix 1 cup of coconut milk with 1 tbsp of lime juice and let sit for 5 minutes'). Always provide the structured 'ratio' field for interactive recipe scaling.
5. **Localization:** Highlight locally accessible Southeast Asian pantry ingredients (e.g., coconut milk, calamansi, tamarind, palm sugar, pandan, candlenut, tapioca).
6. **Output JSON:** You MUST respond with a valid JSON array matching the exact schema provided.`;
};

const generateImageForIngredient = async (ingredientName: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: `A clear, high-quality, photorealistic culinary photograph of raw '${ingredientName}', clean bright studio lighting, neutral background, centered food ingredient.`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return '';
  } catch {
    // Graceful fallback if image generation model is unavailable or rate-limited
    return '';
  }
};

export const identifyIngredientFromImage = async (
  base64Image: string,
  mimeType: string,
  language: Language = 'en'
): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };

    const promptText = language === 'id'
      ? "Identifikasi bahan makanan, rempah, atau bumbu dapur utama pada foto ini. Berikan HANYA nama bahannya dalam Bahasa Indonesia kuliner yang umum digunakan sehari-hari (misal: 'Santan Kelapa', 'Lengkuas', 'Kemiri', 'Daun Jeruk Purut', 'Gula Aren', dsb.). Jika bukan makanan, jawab 'Unknown'. Berikan jawaban sangat ringkas (hanya nama bahan)."
      : "Identify the primary food ingredient, spice, or pantry item in this image. Provide only the culinary name of the ingredient in natural English (e.g., 'Coconut Milk', 'Galangal', 'Candlenut', 'Lime Leaves', 'Palm Sugar'). If it is not a food item, respond with 'Unknown'. Be very concise (ingredient name only).";

    const textPart = {
      text: promptText,
    };

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [imagePart, textPart] },
    });

    const resultText = response.text?.trim() || '';

    if (resultText.toLowerCase() === 'unknown' || resultText === '') {
      throw new Error(
        language === 'id'
          ? "Tidak dapat mengenali bahan makanan pada gambar ini."
          : "Could not identify a food ingredient in the image."
      );
    }

    return resultText;
  } catch (error) {
    console.error("Error identifying ingredient from image:", error);
    throw new Error(
      language === 'id'
        ? "Gagal menganalisis gambar. Silakan coba gambar lain atau ketikkan nama bahan secara manual."
        : "Failed to analyze the image. Please try another image or enter the ingredient manually."
    );
  }
};

export const findSubstitutions = async (
  ingredient: string,
  context: string,
  language: Language = 'en',
  activeFilters: PantryFilterId[] = []
): Promise<Substitution[]> => {
  try {
    const isId = language === 'id';

    // Compile dietary and pantry filter rules into prompt constraints
    const filterInstructions = activeFilters
      .map(filterId => {
        const item = PANTRY_FILTERS.find(f => f.id === filterId);
        return item ? (isId ? item.promptInstructionId : item.promptInstructionEn) : '';
      })
      .filter(Boolean);

    const filterText = filterInstructions.length > 0
      ? (isId
          ? `\n\nSYARAT & PANTANGAN MUTLAK DARI PENGGUNA (WAJIB DIPATUHI):\n${filterInstructions.map(f => `- ${f}`).join('\n')}`
          : `\n\nSTRICT DIETARY RESTRICTIONS & PREFERENCES (MANDATORY):\n${filterInstructions.map(f => `- ${f}`).join('\n')}`)
      : '';

    const prompt = isId
      ? `Carikan 1-3 bahan pengganti (substitusi) lokal terbaik untuk bahan berikut:
Bahan yang ingin diganti: "${ingredient}"
Konteks masakan & kebutuhan khusus: "${context || 'Penggunaan umum, tidak ada catatan khusus.'}"${filterText}

Ingat: Berikan interpretasi kuliner kontekstual dalam Bahasa Indonesia yang luwes dan lezat, bukan terjemahan harfiah kaku. Pastikan mengisi field 'ratio' dengan takaran awal 1 unit agar kalkulator resep bekerja akurat.`
      : `Find 1-3 best local culinary substitutions for the following ingredient:
Ingredient to replace: "${ingredient}"
Recipe context and dietary needs: "${context || 'General use, no additional restrictions.'}"${filterText}

Remember: Provide contextual culinary interpretation with rich gastronomic flavor and practical ratios, not mechanical literal translations. Ensure the 'ratio' object is provided with accurate base scaling factors.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(language),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      throw new Error(
        isId
          ? "AI tidak menemukan alternatif bahan yang pas. Coba ubah nama bahan atau sesuaikan filter pantangan."
          : "The AI returned an empty response. This might be because no suitable local substitutes were found."
      );
    }

    const parsedSubstitutions: Omit<Substitution, 'imageUrl' | 'language'>[] = JSON.parse(jsonText);

    if (parsedSubstitutions.length === 0) {
      return [];
    }

    // Generate images for substitutions concurrently
    const substitutionsWithImages: Substitution[] = await Promise.all(
      parsedSubstitutions.map(async (sub) => {
        const imageUrl = await generateImageForIngredient(sub.substituteName);
        return {
          ...sub,
          imageUrl,
          language,
        };
      })
    );

    return substitutionsWithImages;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API Key')) {
      throw error;
    }
    if (error instanceof Error && error.message.includes('json')) {
      throw new Error(
        language === 'id'
          ? "Format data dari AI tidak sesuai. Silakan coba ulangi pencarian."
          : "The AI returned a response that was not in the correct format. Please try rephrasing your request."
      );
    }
    throw new Error(
      language === 'id'
        ? "Gagal mendapatkan saran dari AI. Periksa koneksi atau coba beberapa saat lagi."
        : "Failed to get suggestions from the AI. Please check your connection or try again later."
    );
  }
};

/**
 * Contextually re-interprets existing substitutions into a target language
 * preserving culinary nuance, sensory flavor profile, and cooking ratios without direct literal translation.
 */
export const interpretSubstitutionsLanguage = async (
  currentSubstitutions: Substitution[],
  targetLanguage: Language,
  originalIngredient: string
): Promise<Substitution[]> => {
  if (!currentSubstitutions || currentSubstitutions.length === 0) {
    return [];
  }

  try {
    const isTargetId = targetLanguage === 'id';
    const cleanList = currentSubstitutions.map(({ substituteName, reasoning, howToUse, bestFor, ratio }) => ({
      substituteName,
      reasoning,
      howToUse,
      bestFor,
      ratio,
    }));

    const prompt = isTargetId
      ? `Berikut adalah data saran pengganti bahan masakan untuk "${originalIngredient}".
Interpretasikan dan alihkan data ini ke dalam Bahasa Indonesia kuliner yang alami, akrab di dapur, dan menggugah selera.
PENTING:
- Jangan terjemahkan secara kaku kata demi kata. Adaptasikan istilah rasa, tekstur, dan takaran memasak agar sesuai dengan kebiasaan juru masak di Indonesia.
- Pertahankan inti fungsi bahan, rasio konversi resep, dan unit takarannya.

Data sumber:
${JSON.stringify(cleanList, null, 2)}`
      : `Here is culinary substitution data for "${originalIngredient}".
Interpret and adapt this data into natural, expressive culinary English with vivid flavor profile terminology, clear ratios, and engaging gastronomic style.
CRITICAL:
- Do not perform literal translation. Provide genuine culinary interpretation tailored for international cooking enthusiasts.
- Retain exact cooking functions, recipe conversion ratios, and substitute purposes.

Source data:
${JSON.stringify(cleanList, null, 2)}`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(targetLanguage),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      return currentSubstitutions;
    }

    const translatedItems: Omit<Substitution, 'imageUrl' | 'language'>[] = JSON.parse(jsonText);

    return translatedItems.map((item, index) => ({
      ...item,
      imageUrl: currentSubstitutions[index]?.imageUrl || '',
      language: targetLanguage,
    }));
  } catch (err) {
    console.warn("Contextual language interpretation error, retaining existing content:", err);
    return currentSubstitutions;
  }
};
