import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { apiRouter } from './routes';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (_req, res) => {
  res.json({
    app: 'brooo.ai API',
    tagline: 'Send it to brooo.',
    version: '0.1.0',
    status: 'online',
  });
});

// API Router
app.use('/api/v1', apiRouter);

// Start server
app.listen(ENV.PORT, () => {
  console.log(`🚀 brooo.ai Action Engine API running on http://localhost:${ENV.PORT}`);
  console.log(`🤖 AI Provider: ${ENV.AI_PROVIDER.toUpperCase()}`);
  console.log(`⚡ Fast Model: ${ENV.OPENAI_MODEL_FAST} | Complex Model: ${ENV.OPENAI_MODEL_COMPLEX}`);
});

export default app;

