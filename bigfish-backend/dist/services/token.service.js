// src/services/token.service.ts
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { getJwtSecret, getEnv } from '../utils/env.js';
const JWT_SECRET = getJwtSecret();
const ACCESS_TOKEN_EXPIRES = getEnv('ACCESS_TOKEN_EXPIRES', '15m');
const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(getEnv('REFRESH_TOKEN_EXPIRES_DAYS', '7'));
/**
 * Генерує випадковий токен
 */
export function generateRandomToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
}
/**
 * Створює access токен (короткоживучий)
 */
export function createAccessToken(user) {
    return jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email, type: 'access' }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
}
/**
 * Створює refresh токен та зберігає в БД
 * Обмежує кількість активних сесій до 3
 */
export async function createRefreshToken(userId, userAgent, ip) {
    const token = generateRandomToken(64);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    // SECURITY: Обмеження сесій - максимум 3 активні токени на користувача
    const activeTokens = await prisma.refreshToken.count({
        where: {
            userId,
            revokedAt: null,
            expiresAt: { gt: new Date() }
        }
    });
    // Якщо вже є 3 активні токени, видаляємо найстаріший
    if (activeTokens >= 3) {
        const oldestToken = await prisma.refreshToken.findFirst({
            where: {
                userId,
                revokedAt: null,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'asc' }
        });
        if (oldestToken) {
            await prisma.refreshToken.update({
                where: { id: oldestToken.id },
                data: { revokedAt: new Date() }
            });
        }
    }
    await prisma.refreshToken.create({
        data: {
            token,
            userId,
            userAgent,
            ip,
            expiresAt,
        },
    });
    return token;
}
/**
 * Створює пару токенів (access + refresh)
 */
export async function createTokenPair(user, userAgent, ip) {
    const accessToken = createAccessToken(user);
    const refreshToken = await createRefreshToken(user.id, userAgent, ip);
    return { accessToken, refreshToken };
}
/**
 * Перевіряє refresh токен та повертає нову пару токенів
 */
export async function refreshTokens(refreshToken, userAgent, ip) {
    const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
    });
    // Токен не знайдено або відкликано
    if (!tokenRecord || tokenRecord.revokedAt) {
        return null;
    }
    // Токен протермінований
    if (tokenRecord.expiresAt < new Date()) {
        await prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revokedAt: new Date() },
        });
        return null;
    }
    // Відкликаємо старий токен (token rotation)
    await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
    });
    // Створюємо нову пару токенів
    const user = tokenRecord.user;
    return createTokenPair({ id: user.id, name: user.name, email: user.email, role: user.role }, userAgent, ip);
}
/**
 * Відкликає конкретний refresh токен
 */
export async function revokeRefreshToken(token) {
    await prisma.refreshToken.updateMany({
        where: { token, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}
/**
 * Відкликає всі refresh токени користувача (logout з усіх пристроїв)
 */
export async function revokeAllUserTokens(userId) {
    await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}
/**
 * Верифікує access токен
 */
export function verifyAccessToken(token) {
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (payload.type !== 'access')
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
/**
 * Очищає протерміновані токени (для cron job)
 */
export async function cleanupExpiredTokens() {
    const result = await prisma.refreshToken.deleteMany({
        where: {
            OR: [
                { expiresAt: { lt: new Date() } },
                { revokedAt: { not: null } },
            ],
        },
    });
    return result.count;
}
