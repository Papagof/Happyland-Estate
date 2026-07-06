const express = require('express');
const cors = require('cors');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Define it in backend/.env before starting the server.');
  process.exit(1);
}

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const residentsRouter = require('./routes/residents');
const executivesRouter = require('./routes/executives');
const propertiesRouter = require('./routes/properties');
const paymentsRouter = require('./routes/payments');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/residents', residentsRouter);
app.use('/api/executives', executivesRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/payments', paymentsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Happyland Estate API running on port ${PORT}`));
