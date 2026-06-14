/**
 * Middleware generico per la validazione del body della richiesta tramite schemi Zod.
 * Non conosce i DTO o le rotte specifiche, garantendo il disaccoppiamento (Clean Architecture).
 */
export const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      // 1. Valida i dati in ingresso direttamente con lo schema Zod passato come argomento
      const parsedData = await schema.parseAsync(req.body);
      
      // 2. Sostituisce il body con i dati validati da Zod (filtrando eventuali campi extra non previsti dallo schema)
      req.body = parsedData; 
      
      next();
    } catch (error) {
      // 3. Gestione e formattazione degli errori di validazione Zod per il frontend (React Native)
      if (error.name === "ZodError") {
        const formattedErrors = error.errors.map(err => ({
          field: err.path[0], // Es: "email", "password"
          message: err.message
        }));
        
        return res.status(400).json({
          status: 'error',
          type: 'ValidationError',
          errors: formattedErrors
        });
      }
      
      // Passa eventuali errori imprevisti al globalErrorHandler
      next(error);
    }
  };
};