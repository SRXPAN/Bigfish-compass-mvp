// packages/shared/src/types/index.ts
export function getTranslation(json, lang, fallback = '') {
    if (!json)
        return fallback;
    return json[lang] ?? json['EN'] ?? fallback;
}
// ============================================
// VALIDATION CONSTANTS
// ============================================
export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 100,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 255,
    SLUG_MAX_LENGTH: 100,
    CONTENT_MAX_LENGTH: 50000,
    URL_MAX_LENGTH: 2000,
};
