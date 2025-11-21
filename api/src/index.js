require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { checkDb } = require('./database/db');
const forumRouter = require('./routes/forum');
const usersRouter = require('./routes/users');
const analysisRouter = require('./routes/analysis');

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(helmet());
app.use(cors({
  origin: true, // reflect request origin (configure to your frontend for production)
  credentials: true,
}));
// Increase body size limits to allow larger avatar uploads (default 5mb adjustable via BODY_LIMIT env)
const bodyLimit = process.env.BODY_LIMIT || '5mb';
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/forum', forumRouter);
app.use('/api/users', usersRouter);
app.use('/api/analysis', analysisRouter);

app.get('/', (_req, res) => res.json({ ok: true }));

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, async () => {
  const db = await checkDb();
  console.log(db ? 'DB connected' : 'DB not reachable');
  console.log(`API listening on port ${PORT}`);
});
