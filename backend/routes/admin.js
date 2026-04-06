const express = require('express');
const router = express.Router();
const db = require('../db');
const { ensureAdmin } = require('../middleware/auth');

router.get('/stats', ensureAdmin, (req, res) => {
  const stats = {};
  db.get(`SELECT COUNT(*) as total FROM animals`, [], (err, a) => {
    stats.total_animals = a?.total || 0;
    db.get(`SELECT COUNT(*) as total FROM animals WHERE up_for_adoption='Up for adoption'`, [], (err, av) => {
      stats.available_animals = av?.total || 0;
      db.get(`SELECT COUNT(*) as total FROM users WHERE role='user'`, [], (err, u) => {
        stats.total_users = u?.total || 0;
        db.get(`SELECT COALESCE(SUM(amount),0) as total FROM donations`, [], (err, d) => {
          stats.total_donations = d?.total || 0;
          db.get(`SELECT COUNT(*) as total FROM adoption_requests WHERE status='Pending'`, [], (err, p) => {
            stats.pending_requests = p?.total || 0;
            db.get(`SELECT COUNT(*) as total FROM adoption_requests WHERE status='Approved'`, [], (err, ap) => {
              stats.approved_adoptions = ap?.total || 0;
              db.get(`SELECT COUNT(*) as total FROM posts`, [], (err, po) => {
                stats.total_posts = po?.total || 0;
                db.get(`SELECT COUNT(*) as total FROM animals WHERE health_status='Needs treatment'`, [], (err, nt) => {
                  stats.needs_treatment = nt?.total || 0;
                  res.json(stats);
                });
              });
            });
          });
        });
      });
    });
  });
});

router.get('/recent-activity', ensureAdmin, (req, res) => {
  db.all(`SELECT 'adoption' as type, ar.date, u.name as actor, a.name as subject
    FROM adoption_requests ar JOIN users u ON ar.user_id=u.id JOIN animals a ON ar.animal_id=a.id
    UNION ALL
    SELECT 'donation' as type, d.date, u.name as actor, dd.title as subject
    FROM donations d JOIN users u ON d.user_id=u.id JOIN donation_drives dd ON d.drive_id=dd.id
    ORDER BY date DESC LIMIT 10`,
    [], (err, rows) => res.json(rows || []));
});

module.exports = router;
