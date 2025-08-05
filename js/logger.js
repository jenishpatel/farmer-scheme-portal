// This module provides a simple, centralized logging service for the application.

const LogLevel = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
};

/**
 * The core logging function.
 * @param {string} level - The log level (e.g., 'INFO', 'ERROR').
 * @param {string} message - The main log message.
 * @param {object} [context={}] - Optional object for additional context.
 */
function log(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;

    // In a real production app, you might send this to a logging service.
    // For this project, we'll use the browser's console.
    switch (level) {
        case LogLevel.ERROR:
            console.error(formattedMessage, context);
            break;
        case LogLevel.WARN:
            console.warn(formattedMessage, context);
            break;
        case LogLevel.INFO:
        default:
            console.log(formattedMessage, context);
            break;
    }
}

/**
 * Logs an informational message. Use for general application flow events.
 * @param {string} message - The info message.
 * @param {object} [context={}] - Optional context.
 */
export function logInfo(message, context) {
    log(LogLevel.INFO, message, context);
}

/**
 * Logs a warning message. Use for non-critical issues that should be noted.
 * @param {string} message - The warning message.
 * @param {object} [context={}] - Optional context.
 */
export function logWarn(message, context) {
    log(LogLevel.WARN, message, context);
}

/**
 * Logs an error message. Use for failed operations or unexpected errors.
 * @param {string} message - The error message.
 * @param {object} [context={}] - Optional context, often the error object itself.
 */
export function logError(message, context) {
    log(LogLevel.ERROR, message, context);
}
