export const globalErrorHandler = (err, req, res, next) => {
  // 1. Assegniamo uno status code di default (500 = Internal Server Error)
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // 2. Logghiamo l'errore nella console del server Docker per il debugging
  console.error('❌ [ERROR HANDLER]:', err);

  // 3. Rispondiamo al frontend (Axios) in modo standardizzato
  res.status(statusCode).json({
    status: status,
    type: err.type || 'ServerError',
    message: err.message || 'Si è verificato un errore interno del server.',
    // Mostriamo lo stack trace solo se siamo in ambiente di sviluppo local
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};