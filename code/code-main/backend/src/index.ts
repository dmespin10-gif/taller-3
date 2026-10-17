// src/index.ts
// Composition Root: único lugar donde se decide QUÉ implementación concreta se usa.

// Cargar variables de entorno antes de acceder a process.env
try {
  process.loadEnvFile();
} catch {
  // Ignorar si el archivo .env no existe o ya fue cargado por flags de Node
}

import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { MongoEmployeeRepository } from './repositories/mongo-employee.repository.js';

const PORT = Number(process.env['PORT'] ?? 3000);
const MONGO_URI = process.env['MONGO_URI'] ?? 'mongodb://127.0.0.1/usuarios_db';

const bootstrap = async (): Promise<void> => {
  await connectDatabase(MONGO_URI);
  const employeeRepository = new MongoEmployeeRepository();

  const app = createApp({ employeeRepository });
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}/api/v1`);
  });
};

void bootstrap();
