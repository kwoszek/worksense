require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { checkDb } = require('./database/db');

const forumRouter = require('./routes/forum');

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/forum', forumRouter);

app.use((req, res) => {
	res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
	res.status("500").json({ error: err.message });
});

app.listen(PORT, async () => {
	const db = await checkDb();
    console.log(db ? 'DB connected' : 'DB not reachable');
	console.log(`API listening on port ${PORT}`);
});
