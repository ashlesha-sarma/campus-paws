const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'campuspaws.db'));

const updates = [
  { name: 'Maya', photo: '/uploads/maya.jpg' },
  { name: 'Cooper', photo: '/uploads/cooper.jpg' },
  { name: 'Ginger', photo: '/uploads/ginger.png' },
  { name: 'Sparky', photo: '/uploads/sparky.jpg' },
  { name: 'Buddy', photo: '/uploads/buddy.jpg' },
  { name: 'Tiger', photo: '/uploads/tiger.avif' },
  { name: 'Zara', photo: '/uploads/zara.jpg' },
  { name: 'Juno', photo: '/uploads/juno.avif' }
];

db.serialize(() => {
  const stmt = db.prepare(`UPDATE animals SET image_path = ? WHERE name = ?`);
  updates.forEach(u => {
    stmt.run(u.photo, u.name, function(err) {
      if (err) console.error(`Error updating ${u.name}: ${err.message}`);
      else console.log(`Updated ${u.name} - ${this.changes} row(s)`);
    });
  });
  stmt.finalize(() => {
    console.log('All updates complete.');
    process.exit(0);
  });
});
