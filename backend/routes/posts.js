const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({ storage });

router.get('/', (req, res) => {
  const userId = req.session.user ? req.session.user.id : 0;
  db.all(`SELECT p.*, u.name AS author_name,
    (SELECT COUNT(*) FROM post_likes WHERE post_id=p.id) AS like_count,
    (SELECT COUNT(*) FROM post_likes WHERE post_id=p.id AND user_id=?) AS user_liked
    FROM posts p JOIN users u ON p.user_id=u.id ORDER BY p.date DESC`,
    [userId], (err, rows) => res.json(rows || []));
});

router.post('/', ensureAuth, upload.single('image'), (req, res) => {
  const b = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  if (!b.title || !b.content) return res.status(400).json({ error: 'Title and content required' });
  db.run(`INSERT INTO posts (user_id,title,content,image_path,date) VALUES (?,?,?,?,datetime('now'))`,
    [req.session.user.id, b.title, b.content, image],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
});

router.post('/:id/like', ensureAuth, (req, res) => {
  db.get(`SELECT id FROM post_likes WHERE post_id=? AND user_id=?`, [req.params.id, req.session.user.id], (err, row) => {
    if (row) {
      db.run(`DELETE FROM post_likes WHERE post_id=? AND user_id=?`, [req.params.id, req.session.user.id],
        () => res.json({ liked: false }));
    } else {
      db.run(`INSERT INTO post_likes (post_id,user_id) VALUES (?,?)`, [req.params.id, req.session.user.id],
        () => res.json({ liked: true }));
    }
  });
});

router.delete('/:id', ensureAuth, (req, res) => {
  const userId = req.session.user.id;
  const isAdmin = req.session.user.role === 'admin';
  db.get(`SELECT user_id FROM posts WHERE id=?`, [req.params.id], (err, row) => {
    if (!row) return res.status(404).json({ error: 'Post not found' });
    if (!isAdmin && row.user_id !== userId) return res.status(403).json({ error: 'Not authorized' });
    db.run(`DELETE FROM posts WHERE id=?`, [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

module.exports = router;
