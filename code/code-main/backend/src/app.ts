// src/app.ts
// Fábrica de la aplicación Express. Recibe sus dependencias desde afuera (index.ts).
import express, { type Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import type { IEmployeeRepository } from './repositories/employee.repository.interface.js';
import { EmployeeController } from './controllers/employee.controller.js';
import { createEmployeeRouter } from './routes/employee.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

export interface AppDependencies {
  employeeRepository: IEmployeeRepository;
}

export const createApp = ({ employeeRepository }: AppDependencies): Express => {
  const app = express();

  // Settings
  app.set('nombreApp', 'Gestión de empleados');

  // Middlewares globales
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '100kb' }));

  // Rutas
  const employeeController = new EmployeeController(employeeRepository);
  app.use('/api/v1', createEmployeeRouter(employeeController));

  // Interceptores finales (el orden importa: 404 y luego errores)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
