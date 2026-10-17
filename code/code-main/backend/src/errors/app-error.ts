// src/errors/app-error.ts
// Jerarquía de errores de aplicación: el middleware global los traduce a respuestas HTTP.

export interface ErrorDetail {
  field: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details: ErrorDetail[] | null = null,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message);
  }
}

export class ValidationError extends AppError {
  constructor(details: ErrorDetail[], message = 'Los datos enviados no son válidos') {
    super(400, message, details);
  }
}
