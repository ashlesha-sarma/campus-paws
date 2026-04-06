const express = require('express');
const router = express.Router();
const db = require('../db');
const { ensureAdmin, ensureAuth } = require('../middleware/auth');

router.post('/', ensureAuth, (req, res) => {
  const b = req.body;
  if (!b.animal_id || !b.reason) return res.status(400).json({ error: 'Missing required fields' });
  db.run(`INSERT INTO adoption_requests (animal_id,user_id,fullname,email,phone,address,reason,experience,status,date) VALUES (?,?,?,?,?,?,'${b.reason}','${b.experience || 'No'}','Pending',datetime('now'))`,
    [b.animal_id, req.session.user.id, b.fullname || req.session.user.name, b.email || req.session.user.email, b.phone || '', b.address || ''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
});

router.get('/mine', ensureAuth, (req, res) => {
  db.all(`SELECT ar.id AS request_id, ar.reason, ar.status, ar.date, ar.experience, a.name AS animal_name, a.species, a.image_path FROM adoption_requests ar JOIN animals a ON ar.animal_id=a.id WHERE ar.user_id=? ORDER BY ar.date DESC`,
    [req.session.user.id],
    (err, rows) => res.json(rows || []));
});

router.get('/', ensureAdmin, (req, res) => {
  db.all(`SELECT ar.id, ar.reason, ar.status, ar.date, ar.experience, ar.phone, ar.address, u.name AS user_name, u.email AS user_email, a.name AS animal_name, a.species FROM adoption_requests ar JOIN users u ON ar.user_id=u.id JOIN animals a ON ar.animal_id=a.id ORDER BY ar.date DESC`,
    [], (err, rows) => res.json(rows || []));
});

router.put('/:id/status', ensureAdmin, (req, res) => {
  const { status } = req.body;
  if (!['Approved', 'Rejected', 'Pending'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.run(`UPDATE adoption_requests SET status=? WHERE id=?`, [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
