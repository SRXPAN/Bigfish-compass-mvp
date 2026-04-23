/**
 * Коди помилок
 */
export const ErrorCodes = {
    // Auth errors
    UNAUTHORIZED: 'UNAUTHORIZED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
    EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
    // Validation errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    // Resource errors
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    // Permission errors
    FORBIDDEN: 'FORBIDDEN',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    // Rate limiting
    RATE_LIMITED: 'RATE_LIMITED',
    // Server errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    // CSRF
    CSRF_INVALID: 'CSRF_INVALID',
};
/**
 * Хелпер для успішної відповіді
 */
export function sendSuccess(res, data, statusCode = 200, meta) {
    const response = {
        success: true,
        data,
    };
    if (meta) {
        response.meta = meta;
    }
    return res.status(statusCode).json(response);
}
/**
 * Хелпер для помилки
 */
export function sendError(res, code, message, statusCode = 400, details) {
    const response = {
        success: false,
        error: {
            code,
            message,
        },
    };
    if (details) {
        response.error.details = details;
    }
    return res.status(statusCode).json(response);
}
// Shortcut helpers
export const ok = (res, data) => sendSuccess(res, data, 200);
export const created = (res, data) => sendSuccess(res, data, 201);
export const noContent = (res) => res.status(204).send();
export const badRequest = (res, message, details) => sendError(res, ErrorCodes.VALIDATION_ERROR, message, 400, details);
export const unauthorized = (res, code = ErrorCodes.UNAUTHORIZED, message = 'Unauthorized') => sendError(res, code, message, 401);
export const forbidden = (res, message = 'Forbidden') => sendError(res, ErrorCodes.FORBIDDEN, message, 403);
export const notFound = (res, message = 'Not found') => sendError(res, ErrorCodes.NOT_FOUND, message, 404);
export const conflict = (res, message) => sendError(res, ErrorCodes.ALREADY_EXISTS, message, 409);
export const tooManyRequests = (res, message = 'Too many requests') => sendError(res, ErrorCodes.RATE_LIMITED, message, 429);
export const serverError = (res, message = 'Internal server error') => sendError(res, ErrorCodes.INTERNAL_ERROR, message, 500);
/**
 * Pagination helper для списків
 */
export function paginate(res, items, total, page, limit) {
    return sendSuccess(res, items, 200, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
}
