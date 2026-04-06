const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const cors = require('cors');
const path = require('path');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
  'https://campus-paws.onrender.com', // Added possible render url
  'https://campuspaws-frontend.onrender.com'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Flexible check: includes and startsWith
    const isAllowed = allowedOrigins.some(ao => origin.startsWith(ao));
    if (isAllowed) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isProd = process.env.NODE_ENV === 'production';

app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }),
  secret: process.env.SESSION_SECRET || 'campuspaws-secret-2025',
  resave: false,
  saveUninitialized: false,
  proxy: isProd, // Required for secure cookies on Render
  cookie: {
    secure: isProd, // true in production
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax', // Use 'none' for cross-domain sessions
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/animals', require('./routes/animals'));
app.use('/api/adoptions', require('./routes/adoptions'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🐾 CampusPaws backend running on http://localhost:${PORT}`));
