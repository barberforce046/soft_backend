const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

let lastMongoError = null;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cuts', require('./routes/cuts'));

app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const db = states[mongoose.connection.readyState] || 'unknown';
  res.json({ status: 'ok', database: db, uptime: process.uptime(), timestamp: new Date().toISOString(), hasMongoUri: !!process.env.MONGO_URI, vercel: !!process.env.VERCEL, lastMongoError });
});

app.get('/', (req, res) => {
  res.send('Softbarber API running');
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connection.on('error', (err) => { lastMongoError = err && err.message ? err.message : String(err); });
mongoose.connection.on('connected', () => { lastMongoError = null; });

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('MongoDB Connected');
    if (!process.env.VERCEL) {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  })
  .catch(err => { lastMongoError = err && err.message ? err.message : String(err); console.log(err); });

module.exports = app;
