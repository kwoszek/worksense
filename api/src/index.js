require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { checkDb } = require('./database/db');
const forumRouter = require('./routes/forum');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(helmet());
app.use(cors({
  origin: true, // reflect request origin (configure to your frontend for production)
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/forum', forumRouter);
app.use('/api/users', usersRouter);

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
