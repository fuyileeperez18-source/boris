// Middleware para manejo global de errores
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de express-validator
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.array()
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Error de base de datos PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return res.status(409).json({
          success: false,
          message: 'El registro ya existe'
        });
      case '23503': // foreign_key_violation
        return res.status(400).json({
          success: false,
          message: 'Referencia inválida'
        });
      case '23502': // not_null_violation
        return res.status(400).json({
          success: false,
          message: 'Campo requerido faltante'
        });
    }
  }

  // Error personalizado con código de estado
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Clase para errores personalizados
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
