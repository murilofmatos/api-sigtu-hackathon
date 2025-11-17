import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // Middlewares de segurança
  app.use(helmet());
  app.use(cors());

  // Logger
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rotas
  app.use('/api', routes);

  // Error handler (deve ser o último middleware)
  app.use(errorHandler);

  return app;
};
