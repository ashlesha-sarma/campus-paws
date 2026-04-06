const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'campuspaws.db'));

db.run(
  `UPDATE animals SET image_path = ? WHERE name = ?`,
  ['/uploads/zara.webp', 'Zara'],
  function(err) {
    if (err) console.error(err.message);
    else console.log(`Updated Zara - ${this.changes} row(s)`);
    process.exit(0);
  }
);
