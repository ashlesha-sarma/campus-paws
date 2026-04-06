const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'campuspaws.db'));

db.run(
  `UPDATE donation_drives SET photo = ? WHERE title = ?`,
  ['/uploads/vaccination drive animal.jpg', 'Vaccination Drive 2026'],
  function(err) {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }
    console.log(`Updated ${this.changes} row(s)`);
    process.exit(0);
  }
);
