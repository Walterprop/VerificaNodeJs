class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    this.isOperational = true; // utile per distinguere errori previsti da errori di sistema
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;