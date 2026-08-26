import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Krishan Software Solution backend is running",
  });
});

// Error handling middleware
app.use(errorMiddleware);

export default app;
