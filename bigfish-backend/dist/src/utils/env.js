// src/utils/env.ts
import { logger } from './logger.js';
/**
 * Безпечне отримання змінних середовища
 * Виводить зрозуміле повідомлення та завершує процес якщо критична змінна відсутня
 */
export function requireEnv(name, description) {
    const value = process.env[name];
    if (!value) {
        const message = description
            ? `❌ Missing required environment variable: ${name}\n   Description: ${description}\n   Please set this variable in your .env file or environment.`
            : `❌ Missing required environment variable: ${name}\n   Please set this variable in your .env file or environment.`;
        logger.error(message);
        // В продакшені - завершуємо процес
        if (process.env.NODE_ENV === 'production') {
            logger.error('Application cannot start without required environment variables. Exiting...');
            process.exit(1);
        }
        else {
            // В dev режимі - кидаємо помилку для розробника
            throw new Error(message);
        }
    }
    return value;
}
/**
 * Отримання змінної з fallback значенням
 * Використовувати ТІЛЬКИ для некритичних налаштувань
 */
export function getEnv(name, fallback) {
    const value = process.env[name];
    if (!value) {
        logger.warn(`⚠️  Using fallback value for ${name}: "${fallback}"`);
        return fallback;
    }
    return value;
}
/**
 * Отримання числової змінної
 */
export function getEnvNumber(name, fallback) {
    const value = process.env[name];
    if (!value)
        return fallback;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
}
/**
 * Перевірка чи production середовище
 */
export function isProd() {
    return process.env.NODE_ENV === 'production';
}
// Критичні змінні - завантажуються при старті
let _jwtSecret = null;
export function getJwtSecret() {
    if (_jwtSecret)
        return _jwtSecret;
    _jwtSecret = requireEnv('JWT_SECRET', 'Secret key for JWT token signing (use a long random string)');
    return _jwtSecret;
}
