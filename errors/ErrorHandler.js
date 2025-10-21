function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Errore interno del server';

  // Gestione errori specifici MongoDB
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Risorsa già esistente';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'ID non valido';
  }

  // Log dell'errore per debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('Errore catturato:', {
      message: err.message,
      stack: err.stack,
      statusCode: statusCode,
      isOperational: err.isOperational
    });
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      error: err.name 
    })
  });
}

module.exports = errorHandler;