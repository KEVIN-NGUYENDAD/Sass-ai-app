import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Analytics routes (placeholder)
app.get('/api/analytics/daily', (req, res) => {
  res.json({
    message: 'Daily analytics endpoint',
    date: new Date().toISOString().split('T')[0],
  });
});

// Filter optimization routes (placeholder)
app.post('/api/filters/optimize', (req, res) => {
  const { orders, rejections } = req.body;

  // TODO: Implement optimization logic
  res.json({
    message: 'Filter optimization',
    suggestedCriteria: {
      minPrice: 10,
      maxDistance: 3,
    },
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Backend running on port ${PORT}`);
});
