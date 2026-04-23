/**
 * Отримує переклад з JSON поля або fallback значення
 * @param json - JSON об'єкт з перекладами {"UA": "...", "PL": "...", "EN": "..."}
 * @param lang - Мова користувача
 * @param fallback - Значення за замовчуванням (зазвичай EN версія)
 */
export function getTranslation(json, lang, fallback) {
    if (!json || typeof json !== 'object')
        return fallback;
    const translations = json;
    // Спробувати отримати переклад для запитаної мови
    if (translations[lang])
        return translations[lang];
    // Fallback на EN
    if (translations['EN'])
        return translations['EN'];
    // Повернути будь-який доступний переклад
    const firstAvailable = Object.values(translations)[0];
    if (firstAvailable)
        return firstAvailable;
    return fallback;
}
/**
 * Отримує вкладений переклад (для об'єктів типу {topic: {UA, PL, EN}, advice: {UA, PL, EN}})
 */
export function getNestedTranslation(json, field, lang, fallback = '') {
    if (!json || typeof json !== 'object')
        return fallback;
    const fieldTranslations = json[field];
    return getTranslation(fieldTranslations, lang, fallback);
}
/**
 * Трансформує об'єкт з JSON перекладами в об'єкт з локалізованими полями
 */
export function localizeObject(obj, lang, fieldsMap // {"nameJson": "name", "descJson": "description"}
) {
    const result = { ...obj };
    for (const [jsonField, targetField] of Object.entries(fieldsMap)) {
        const json = obj[jsonField];
        const fallback = obj[targetField] || '';
        if (json) {
            result[targetField] = getTranslation(json, lang, fallback);
        }
    }
    return result;
}
/**
 * Локалізує масив об'єктів
 */
export function localizeArray(arr, lang, fieldsMap) {
    return arr.map(item => localizeObject(item, lang, fieldsMap));
}
