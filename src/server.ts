import { config } from './config/env';
import initializeFirebase from './config/firebase';
import { createApp } from './app';

// Inicializar Firebase
initializeFirebase();

// Criar aplicação Express
const app = createApp();

// Iniciar servidor
const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
