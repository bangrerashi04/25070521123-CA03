const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// Allow the React dev server (and any extra origins listed in CLIENT_URL).
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
  })
);

app.use(express.json({ limit: '1mb' }));

// Tiny request logger so the terminal shows API calls while demoing.
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
