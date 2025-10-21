const AppError = require('./AppError');

class NotFoundError extends AppError {
  constructor(message = 'Risorsa non trovata') {
    super(message, 404);
  }
}

module.exports = NotFoundError;