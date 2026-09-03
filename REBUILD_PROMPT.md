# Master Rebuild Prompt: SUBTIFY

Gunakan prompt di bawah ini sebagai **Master Blueprint Prompt** jika Anda ingin membangun ulang atau mereproduksi aplikasi ini secara mandiri di AI Coding Agent (seperti Google AI Studio, Antigravity, Claude Code, Cursor, atau sejenisnya).

---

```markdown
# MISSION & SPECIFICATION: BUILD "SUBTIFY" — CULINARY INGREDIENT SUBSTITUTION ASSISTANT

You are an expert full-stack engineer and UI craftsman. Your task is to build a complete, production-ready web application named **SUBTIFY** (Asisten Bahan Pengganti Bumbu & Masakan Lokal).

Read the entire product specification below carefully before writing any code.

---

## 1. PRODUCT PURPOSE & PHILOSOPHY
SUBTIFY helps home cooks, bakers, and food enthusiasts find practical, accessible local ingredient substitutes (especially for Indonesian and Southeast Asian pantries) when a recipe calls for hard-to-find, expensive, non-halal, or restricted international ingredients (e.g., buttermilk, mirin, mascarpone, sour cream, crème fraîche, molasses).

Instead of naive literal word-for-word translation, the app understands the **biochemical and culinary function** of ingredients (acidity, fat content, moisture, leavening, emulsification) and suggests pantry staples that can be bought at local neighborhood markets (*pasar tradisional*), street vendors (*tukang sayur*), or warungs.

---

## 2. CORE FEATURES & SCOPE

1. **Intelligent Substitution Search (Text & Context)**:
   - Input for the ingredient to replace (e.g., "buttermilk", "mirin", "heavy cream").
   - Optional recipe context input with one-click quick chips (e.g., "Baking cakes & chiffon", "Savory stews & curries", "Halal cooking", "Plant-based / Dairy-free").

2. **Dietary & Pantry Restriction Filters**:
   - 6 toggleable filters that inject strict culinary rules into the AI prompt:
     * `halal`: Strictly exclude alcohol, mirin, sake, cooking wine, rum, and non-halal animal gelatin.
     * `dairy_free`: No cow's milk, butter, or dairy derivatives (suggest coconut milk, plant oils, etc.).
     * `gluten_free`: No wheat/all-purpose flour (suggest tapioca, rice flour, cornstarch).
     * `vegan`: 100% plant-based, no dairy, eggs, honey, or animal derivatives.
     * `budget_local`: Prioritize cheap, everyday ingredients found in neighborhood warungs and wet markets.
     * `low_sugar`: Avoid high-refined sugars.

3. **Structured Culinary Substitution Cards**:
   - Return 1–3 curated substitutes. Each substitute MUST include:
     * `substituteName`: Clear, localized name (e.g., "Santan Encer + Perasan Jeruk Nipis").
     * `reasoning`: Separated into `flavor` profile and `texture` dynamics.
     * `howToUse`: Step-by-step culinary mixing technique and proportion.
     * `bestFor`: Specific dishes or cooking methods where it excels.
     * `ratio`: Structured quantitative baseline for calculation (originalAmount, originalUnit, substituteAmount, substituteUnit, prepTip).

4. **Interactive Recipe Ratio Calculator**:
   - Embedded directly in each substitution card.
   - User enters their recipe's required amount (e.g., "250 ml" or "2 cups").
   - Calculator instantly computes the exact equivalent of the substitute, including multiplier shortcuts (0.5x, 1x, 2x) and a button to copy the measured recipe note to the clipboard.

5. **Multimodal Ingredient Scanner (Camera / Image Input)**:
   - Allows users to upload or snap a photo of a raw ingredient or pantry item.
   - AI vision model identifies the primary ingredient and automatically populates the search form.

6. **Local Persistence (Bookmarks & Search History)**:
   - Save favorite substitutions to a sliding drawer panel.
   - Track the last 10 recent searches for instant re-access.
   - Stored in browser `localStorage`.

7. **Bilingual Adaptation (ID / EN)**:
   - Full UI localization in Bahasa Indonesia and English.
   - When language is toggled, dynamically re-interpret active substitution cards using AI to maintain natural culinary terminology without breaking mathematical ratios.

---

## 3. ARCHITECTURE & TECHNICAL EXPECTATIONS

- **Stack**: React 19 + TypeScript + Vite.
- **Backend Architecture**: Full-stack setup with an Express server (`server.ts`) proxying all AI requests.
  * **CRITICAL SECURITY RULE**: Do NOT expose the Gemini API key to the client browser. Create server endpoints:
    - `POST /api/substitutions`: Handles ingredient search with filters and context.
    - `POST /api/identify-image`: Handles image Base64 identification.
    - `POST /api/translate-substitutions`: Handles contextual language adaptation.
  * Server must bind to `0.0.0.0` and port `3000`.
- **AI SDK**: Use `@google/genai` (Google Gen AI SDK) in server-side code only using `process.env.GEMINI_API_KEY`.
- **AI Models**:
  * `gemini-3.8-flash` for structured JSON substitution, vision detection, and language adaptation.
  * For imagery: Provide a clean fallback (such as high-quality curated culinary icons or optional image generation) so the UI never crashes if image generation is rate-limited.

---

## 4. AI PROMPT ENGINEERING & SYSTEM INSTRUCTIONS

The system instruction MUST enforce:
1. **Never translate literally**: Prohibit naive translations (e.g., "buttermilk" -> "susu mentega" is strictly forbidden; it must be explained as milk/coconut milk curdled with lime or vinegar).
2. **Indonesian Culinary Tone**: Warm, authoritative, appetizing, kitchen-tested language.
3. **Strict JSON Output**: Use Gemini's `responseSchema` with:
```typescript
{
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      substituteName: { type: Type.STRING },
      reasoning: {
        type: Type.OBJECT,
        properties: {
          flavor: { type: Type.STRING },
          texture: { type: Type.STRING }
        },
        required: ['flavor', 'texture']
      },
      howToUse: { type: Type.STRING },
      bestFor: { type: Type.STRING },
      ratio: {
        type: Type.OBJECT,
        properties: {
          originalAmount: { type: Type.NUMBER },
          originalUnit: { type: Type.STRING },
          substituteAmount: { type: Type.NUMBER },
          substituteUnit: { type: Type.STRING },
          prepTip: { type: Type.STRING }
        },
        required: ['originalAmount', 'originalUnit', 'substituteAmount', 'substituteUnit']
      }
    },
    required: ['substituteName', 'reasoning', 'howToUse', 'bestFor', 'ratio']
  }
}
```

---

## 5. UI/UX & VISUAL DIRECTION (ANTI-SLOP MANDATES)

- **Color Palette ("Warm Spice & Clean Kitchen")**:
  * Canvas: Warm white / stone background (`#FAF8F5`, `#FFFFFF`).
  * Primary Accent: Warm terracotta / cinnamon (`#C25E2E`, hover `#A94B20`).
  * Secondary Accent: Warm spice amber (`#D97706`).
  * High Contrast Body Text: Deep charcoal (`#1C1917` / `stone-900`).
  * Subtext: Neutral warm stone (`#57534E` / `stone-600`).
  * Strict Ban: NO purple-blue gradients, NO dark cyber neon glows, NO arbitrary glassmorphism.
- **Typography**:
  * UI & Body: `Plus Jakarta Sans` (13px–15px, readable, compact).
  * Headings & Accent: `Newsreader` or elegant editorial serif.
- **Layout & Structure**:
  * Full-screen viewport (`100dvh`) with an atmospheric culinary backdrop.
  * Ergonomic sliding bottom sheet (`max-w-3xl mx-auto`) with clean grab handle, smooth collapse/expand states, and mobile touch optimization.
  * Border radii: Subtle and crisp (`rounded-md` 6px, `rounded-xs` 2px for chips). Do NOT use 24px+ bubble pill cards.
  * Touch targets: Minimum 44px for primary inputs and buttons. Single-line button text (no wrapping inside pills).

---

## 6. WHAT NOT TO BUILD (STRICT CONSTRAINTS)

- Do NOT build a social networking feed, user profile timeline, or comment section.
- Do NOT build an e-commerce checkout or shopping cart integration.
- Do NOT build a recipe blog with 20-step cooking tutorials; keep the focus strictly on **ingredient substitution and scaling**.
- Do NOT use mock data or fake simulation timers; connect real API routes.

---

## 7. DEFINITION OF DONE

1. User can enter an ingredient, select filters, and see 1–3 rich culinary substitution cards.
2. User can adjust the recipe amount in the ratio calculator and see mathematically accurate conversions.
3. User can upload an image from camera/file and have the ingredient auto-detected.
4. User can save items to favorites and view them in a sliding drawer even after refreshing the page.
5. User can switch between Indonesian and English seamlessly.
6. The Gemini API key remains strictly hidden on the server.
7. Code compiles with zero TypeScript errors (`tsc --noEmit`) and passes production build.
```
