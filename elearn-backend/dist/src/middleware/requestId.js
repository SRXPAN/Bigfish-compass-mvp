import crypto from 'crypto';
/**
 * Generates a short unique request ID
 * Format: timestamp-random (e.g., "abc123-xyz789")
 */
function generateRequestId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `${timestamp}-${random}`;
}
/**
 * Request ID middleware
 * - Generates unique ID for each request
 * - Adds X-Request-ID header to response
 * - Records start time for duration tracking
 */
export function requestIdMiddleware(req, res, next) {
    // Use existing ID from header or generate new one
    const requestId = req.headers['x-request-id'] || generateRequestId();
    req.id = requestId;
    req.startTime = Date.now();
    // Add request ID to response header
    res.setHeader('X-Request-ID', requestId);
    next();
}
/**
 * Request logging middleware
 * Logs request completion with duration and status
 */
export function requestLogger(req, res, next) {
    // Log on response finish
    res.on('finish', () => {
        const duration = Date.now() - req.startTime;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
        const logData = {
            requestId: req.id,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.id,
            ip: req.ip,
        };
        if (process.env.NODE_ENV !== 'production') {
            console[logLevel](`[${req.id}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
        }
        else {
            console[logLevel](JSON.stringify(logData));
        }
    });
    next();
}
