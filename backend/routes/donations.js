const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { ensureAdmin, ensureAuth } = require('../middleware/auth');

// ── Razorpay setup ────────────────────────────────────────────────────────────
// Replace these with your actual Razorpay TEST keys from https://dashboard.razorpay.com
const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID     || 'rzp_test_XXXXXXXXXXXXXXXX';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'XXXXXXXXXXXXXXXXXXXXXXXX';

let Razorpay;
let razorpayInstance;
try {
  Razorpay = require('razorpay');
  razorpayInstance = new Razorpay({
    key_id:     RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
} catch (e) {
  console.warn('⚠️  Razorpay package not installed. Run: cd backend && npm install razorpay');
  console.warn('    Falling back to simulated orders for development.');
}

// ── Multer setup ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_')),
});
const upload = multer({ storage });

// ── Helper: fetch drive with donor count ──────────────────────────────────────
function getDriveWithStats(id, cb) {
  db.get(
    `SELECT dd.*,
       (SELECT COUNT(DISTINCT user_id) FROM donations WHERE drive_id = dd.id) AS donor_count
     FROM donation_drives dd WHERE dd.id = ?`,
    [id], cb
  );
}

// ── GET /drives  (all drives + donor count) ───────────────────────────────────
router.get('/drives', (req, res) => {
  db.all(
    `SELECT dd.*,
       (SELECT COUNT(DISTINCT user_id) FROM donations WHERE drive_id = dd.id) AS donor_count
     FROM donation_drives dd ORDER BY created_at DESC`,
    [], (err, rows) => res.json(rows || [])
  );
});

// ── GET /drives/active ────────────────────────────────────────────────────────
router.get('/drives/active', (req, res) => {
  db.all(
    `SELECT dd.*,
       (SELECT COUNT(DISTINCT user_id) FROM donations WHERE drive_id = dd.id) AS donor_count
     FROM donation_drives dd WHERE dd.is_active = 1 ORDER BY created_at DESC`,
    [], (err, rows) => res.json(rows || [])
  );
});

// ── GET /drives/:id  (single drive) ──────────────────────────────────────────
router.get('/drives/:id', (req, res) => {
  getDriveWithStats(req.params.id, (err, row) => {
    if (!row) return res.status(404).json({ error: 'Drive not found' });
    res.json(row);
  });
});

// ── GET /drives/:id/recent  (recent donations for a drive) ────────────────────
router.get('/drives/:id/recent', (req, res) => {
  db.all(
    `SELECT d.amount, d.date, u.name AS donor_name
     FROM donations d JOIN users u ON d.user_id = u.id
     WHERE d.drive_id = ?
     ORDER BY d.date DESC LIMIT 10`,
    [req.params.id], (err, rows) => res.json(rows || [])
  );
});

// ── POST /create-order  (Razorpay order creation) ─────────────────────────────
router.post('/create-order', ensureAuth, async (req, res) => {
  const { amount, drive_id } = req.body;
  if (!amount || amount < 1) return res.status(400).json({ error: 'Invalid amount' });
  if (!drive_id)             return res.status(400).json({ error: 'drive_id required' });

  const amountPaise = Math.round(Number(amount) * 100); // Razorpay works in paise

  // ── If Razorpay SDK is available, create a real order ────────────────────
  if (razorpayInstance) {
    try {
      const order = await razorpayInstance.orders.create({
        amount:   amountPaise,
        currency: 'INR',
        receipt:  `cp_${drive_id}_${Date.now()}`,
        notes:    { drive_id: String(drive_id), user_id: String(req.session.user.id) },
      });
      return res.json({
        order_id:  order.id,
        amount:    order.amount,
        currency:  order.currency,
        key_id:    RAZORPAY_KEY_ID,
        drive_id,
      });
    } catch (e) {
      console.error('Razorpay order error:', e.message);
      // fall through to simulation
    }
  }

  // ── Simulated order (for dev without real keys) ───────────────────────────
  const simOrderId = 'order_sim_' + crypto.randomBytes(10).toString('hex');
  res.json({
    order_id:   simOrderId,
    amount:     amountPaise,
    currency:   'INR',
    key_id:     RAZORPAY_KEY_ID,
    drive_id,
    simulated:  true,
  });
});

// ── POST /verify-payment  (signature verification + record donation) ──────────
router.post('/verify-payment', ensureAuth, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, drive_id, amount, simulated } = req.body;

  if (!drive_id || !amount) return res.status(400).json({ error: 'Missing drive_id or amount' });

  // ── Signature verification (real Razorpay) ────────────────────────────────
  if (!simulated && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
    const body   = razorpay_order_id + '|' + razorpay_payment_id;
    const digest = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (digest !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment signature mismatch. Possible fraud.' });
    }
  }

  // ── Record donation in DB ─────────────────────────────────────────────────
  const parsedAmount = Number(amount);
  db.run(
    `INSERT INTO donations (drive_id, user_id, amount, date) VALUES (?, ?, ?, datetime('now'))`,
    [drive_id, req.session.user.id, parsedAmount],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.run(
        `UPDATE donation_drives SET raised_amount = raised_amount + ? WHERE id = ?`,
        [parsedAmount, drive_id],
        () => {
          getDriveWithStats(drive_id, (err2, drive) => {
            res.json({ success: true, raised_amount: drive?.raised_amount, donor_count: drive?.donor_count });
          });
        }
      );
    }
  );
});

// ── POST /donate  (direct / legacy endpoint — no Razorpay) ────────────────────
router.post('/donate', ensureAuth, (req, res) => {
  const { drive_id, amount } = req.body;
  if (!drive_id || !amount || amount <= 0) return res.status(400).json({ error: 'Invalid donation data' });
  db.run(
    `INSERT INTO donations (drive_id,user_id,amount,date) VALUES (?,?,?,datetime('now'))`,
    [drive_id, req.session.user.id, amount],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.run(
        `UPDATE donation_drives SET raised_amount = raised_amount + ? WHERE id = ?`,
        [amount, drive_id],
        () => res.json({ success: true })
      );
    }
  );
});

// ── GET /my-donations ─────────────────────────────────────────────────────────
router.get('/my-donations', ensureAuth, (req, res) => {
  db.all(
    `SELECT d.amount, d.date, dd.title, dd.id as drive_id
     FROM donations d JOIN donation_drives dd ON d.drive_id = dd.id
     WHERE d.user_id = ? ORDER BY d.date DESC`,
    [req.session.user.id], (err, rows) => res.json(rows || [])
  );
});

// ── Admin: create/update/close/reopen drives ──────────────────────────────────
router.post('/drives', ensureAdmin, upload.single('photo'), (req, res) => {
  const b = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : null;
  db.run(
    `INSERT INTO donation_drives (title,description,target_amount,raised_amount,photo,deadline,is_active) VALUES (?,?,?,0,?,?,1)`,
    [b.title, b.description, b.target_amount, photo, b.deadline],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

router.put('/drives/:id', ensureAdmin, upload.single('photo'), (req, res) => {
  const b = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : b.existing_photo;
  db.run(
    `UPDATE donation_drives SET title=?,description=?,target_amount=?,photo=?,deadline=? WHERE id=?`,
    [b.title, b.description, b.target_amount, photo, b.deadline, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

router.patch('/drives/:id/close', ensureAdmin, (req, res) => {
  db.run(`UPDATE donation_drives SET is_active=0 WHERE id=?`, [req.params.id],
    (err) => { if (err) return res.status(500).json({ error: err.message }); res.json({ success: true }); });
});

router.patch('/drives/:id/reopen', ensureAdmin, (req, res) => {
  db.run(`UPDATE donation_drives SET is_active=1 WHERE id=?`, [req.params.id],
    (err) => { if (err) return res.status(500).json({ error: err.message }); res.json({ success: true }); });
});

module.exports = router;
