const AppError = require('./AppError');

class BadRequestError extends AppError {
  constructor(message = 'Richiesta non valida') {
    super(message, 400);
  }
}

module.exports = BadRequestError;