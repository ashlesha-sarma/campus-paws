const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err || !isMatch) return res.status(400).json({ error: 'Invalid credentials' });
      req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
      res.json({ success: true, user: req.session.user });
    });
  });
});

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  db.get(`SELECT id FROM users WHERE email=?`, [email], (err, exists) => {
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const hash = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')`,
      [name, email, hash],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        req.session.user = { id: this.lastID, name, email, role: 'user' };
        res.json({ success: true, user: req.session.user });
      });
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

router.get('/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

module.exports = router;
