const httpStatus = require('http-status');

/**
 * @extends Error
 */
class ExtendableError extends Error {
  constructor(message, status, isPublic, payload = {}) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.isPublic = isPublic;
    this.payload = payload;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    Error.captureStackTrace(this, this.constructor.name);
  }
}

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   * @param {object} payload - Any extra information to be sent as part of the error
   */
  constructor(
    message,
    status = httpStatus.INTERNAL_SERVER_ERROR,
    isPublic = false,
    payload = {}
  ) {
    super(message, status, isPublic, payload);
  }
}

module.exports = APIError;
