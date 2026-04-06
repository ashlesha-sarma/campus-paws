const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { ensureAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', (req, res) => {
  db.all(`SELECT * FROM animals ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

router.get('/:id', (req, res) => {
  db.get(`SELECT * FROM animals WHERE id=?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || null);
  });
});

router.post('/', ensureAdmin, upload.single('image'), (req, res) => {
  const b = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '/uploads/placeholder.png';
  db.run(`INSERT INTO animals (name,species,breed,age,gender,health_status,vaccination_status,up_for_adoption,location_found,current_location,image_path,description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [b.name, b.species, b.breed, b.age, b.gender, b.health_status, b.vaccination_status, b.up_for_adoption, b.location_found, b.current_location, image, b.description || ''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
});

router.put('/:id', ensureAdmin, upload.single('image'), (req, res) => {
  const b = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : b.existing_image_path;
  db.run(`UPDATE animals SET name=?,species=?,breed=?,age=?,gender=?,health_status=?,vaccination_status=?,up_for_adoption=?,location_found=?,current_location=?,image_path=?,description=? WHERE id=?`,
    [b.name, b.species, b.breed, b.age, b.gender, b.health_status, b.vaccination_status, b.up_for_adoption, b.location_found, b.current_location, image, b.description || '', req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

router.delete('/:id', ensureAdmin, (req, res) => {
  db.run(`DELETE FROM animals WHERE id=?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
