/**
 * Wrapper per gestire automaticamente gli errori nelle funzioni async delle routes
 * Elimina la necessità di scrivere try/catch in ogni route
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;