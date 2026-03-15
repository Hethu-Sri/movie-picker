export const INDIAN_LANGUAGE_POOL = [
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "ml", label: "Malayalam" },
  { code: "kn", label: "Kannada" },
  { code: "bn", label: "Bengali" },
  { code: "mr", label: "Marathi" },
  { code: "pa", label: "Punjabi" },
];

export const WORLD_LANGUAGE_POOL = [
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "it", label: "Italian" },
  { code: "de", label: "German" },
];

const CATEGORY_PROFILES = {
  all: {
    id: "all",
    label: "Pick Random",
    description: "Highly rated movies across every category.",
  },
  "indian-cinema": {
    id: "indian-cinema",
    label: "Indian Cinema",
    description: "A rotating pick across major Indian film industries.",
    languagePool: INDIAN_LANGUAGE_POOL,
  },
  hollywood: {
    id: "hollywood",
    label: "Hollywood",
    description: "English-language picks optimized for US discovery.",
    originalLanguage: "en",
    originalLanguageLabel: "English",
    region: "US",
  },
  "world-cinema": {
    id: "world-cinema",
    label: "World Cinema",
    description: "A rotating international pick outside English-language Hollywood.",
    languagePool: WORLD_LANGUAGE_POOL,
  },
};

const CATEGORY_ALIASES = {
  "": "all",
  all: "all",
  any: "all",
  random: "all",
  indian: "indian-cinema",
  india: "indian-cinema",
  "indian-cinema": "indian-cinema",
  "indian cinema": "indian-cinema",
  hollywood: "hollywood",
  world: "world-cinema",
  "world-cinema": "world-cinema",
  "world cinema": "world-cinema",
};

function pickRandom(items = []) {
  if (!items.length) {
    return null;
  }

  return items[Math.floor(Math.random() * items.length)];
}

function normalizeCategoryKey(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

export function resolveDiscoveryCategory(input) {
  const normalizedKey = normalizeCategoryKey(input);
  const canonicalKey = CATEGORY_ALIASES[normalizedKey] || CATEGORY_ALIASES[String(input || "").trim().toLowerCase()];

  return CATEGORY_PROFILES[canonicalKey || "all"];
}

export function resolveLanguageLabel(code) {
  if (!code) {
    return null;
  }

  const allLanguages = [...INDIAN_LANGUAGE_POOL, ...WORLD_LANGUAGE_POOL, { code: "en", label: "English" }];
  const match = allLanguages.find((language) => language.code === code);
  return match?.label || code.toUpperCase();
}

export function buildDiscoveryContext({ category, fastMode = false } = {}) {
  const profile = resolveDiscoveryCategory(category);
  const selectedLanguage = profile.languagePool ? pickRandom(profile.languagePool) : null;
  const originalLanguage = selectedLanguage?.code || profile.originalLanguage || null;

  return {
    categoryId: profile.id,
    categoryLabel: profile.label,
    description: profile.description,
    fastMode,
    originalLanguage,
    originalLanguageLabel:
      selectedLanguage?.label || profile.originalLanguageLabel || resolveLanguageLabel(originalLanguage),
    region: profile.region || null,
  };
}

export function getCategoryLanguageCodes(category) {
  const profile = resolveDiscoveryCategory(category);

  if (profile.languagePool?.length) {
    return profile.languagePool.map((language) => language.code);
  }

  if (profile.originalLanguage) {
    return [profile.originalLanguage];
  }

  return [];
}

export function getDiscoveryCategories() {
  return Object.values(CATEGORY_PROFILES).map(({ id, label, description }) => ({
    id,
    label,
    description,
  }));
}

