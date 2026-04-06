const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'campuspaws.db');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    bio TEXT,
    profile_pic TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS animals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    age INTEGER,
    gender TEXT,
    health_status TEXT DEFAULT 'Healthy',
    vaccination_status TEXT DEFAULT 'Vaccinated',
    up_for_adoption TEXT DEFAULT 'Up for adoption',
    location_found TEXT,
    current_location TEXT,
    image_path TEXT,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS adoption_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    fullname TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    reason TEXT NOT NULL,
    experience TEXT DEFAULT 'No',
    status TEXT DEFAULT 'Pending',
    date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS donation_drives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    target_amount REAL NOT NULL,
    raised_amount REAL DEFAULT 0,
    photo TEXT,
    deadline TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drive_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(drive_id) REFERENCES donation_drives(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_path TEXT,
    date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS post_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    UNIQUE(post_id, user_id),
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Seed admin user if not exists
  db.get(`SELECT id FROM users WHERE email='admin@campuspaws.test'`, [], (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync('Admin@123', 12);
      db.run(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`,
        ['Campus Admin', 'admin@campuspaws.test', hash]);
    }
  });

  // Seed demo user if not exists
  db.get(`SELECT id FROM users WHERE email='demo@student.test'`, [], (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync('Demo@123', 10);
      db.run(`INSERT INTO users (name, email, password_hash, role, bio) VALUES (?, ?, ?, 'user', ?)`,
        ['Alex Student', 'demo@student.test', hash, 'Animal lover and CS student at Tezpur University']);
    }
  });

  // Seed animals if empty
  db.get(`SELECT COUNT(*) as cnt FROM animals`, [], (err, row) => {
    if (row && row.cnt === 0) {
      const animals = [
        ['Milo','dog','Golden Retriever',2,'Male','Healthy','Vaccinated','Up for adoption','Near Library','Outside Canteen','/uploads/milo.jpg','Milo is a friendly and playful golden boy who loves fetch and cuddles. Found near the main library.'],
        ['Luna','cat','Persian',1,'Female','Healthy','Vaccinated','Up for adoption','Outside ABC Hostel','Near Block B','/uploads/luna.jpg','Luna is a gentle Persian princess with the most expressive eyes. She loves sunny windowsills.'],
        ['Bruno','dog','Labrador',4,'Male','Needs treatment','Not vaccinated','Cannot be adopted','Next to Bus Stand','Under Tree near Admin','/uploads/bruno.jpeg','Bruno is currently receiving medical treatment. He is friendly but needs care before adoption.'],
        ['Simba','cat','Siamese',3,'Male','Healthy','Vaccinated','Adopted','Inside Science Block','Near Parking Lot','/uploads/Simba.webp','Simba found his forever home! He was a chatty, affectionate Siamese who loved attention.'],
        ['Choco','dog','Doodle',1,'Female','Healthy','Vaccinated','Up for adoption','Outside Library Gate','Near Sports Ground','/uploads/choco.jpg','Choco is an energetic doodle puppy who loves to run and play. Very social with people.'],
        ['Sheru','dog','Indian Pariah',3,'Male','Healthy','Vaccinated','Up for adoption','Outside Hostel 5','Near Hostel 5 Entrance','/uploads/sheru.webp','Sheru is the classic campus dog — loyal, smart, and incredibly affectionate once he trusts you.'],
        ['Bella','cat','Mixed',2,'Female','Healthy','Vaccinated','Up for adoption','Next to Cafeteria','Rooftop Garden','/uploads/bella.jpg','Bella is a sweet mixed breed cat who loves chin scratches and sleeping in warm spots.'],
        ['Charlie','dog','Beagle',5,'Male','Needs treatment','Not vaccinated','Cannot be adopted','Near Old Auditorium','Behind Chemistry Dept','/uploads/charlie.jpg','Charlie needs ongoing treatment for a leg injury. Not available for adoption yet.'],
        ['Rocky','dog','Bulldog',4,'Male','Healthy','Vaccinated','Up for adoption','Next to Bus Stand 2','Between Hostel 2 and 3','/uploads/rocky.jpg','Rocky is a calm, lovable bulldog who gets along well with everyone. Low energy, high affection.'],
        ['Moti','dog','Pomeranian',1,'Male','Healthy','Vaccinated','Up for adoption','Near Library','Inside VC Office Lawn','/uploads/moti.jpg','Moti is a tiny ball of fluff with enormous personality. He will steal your heart immediately.'],
        ['Nala','cat','Ragdoll',2,'Female','Healthy','Vaccinated','Up for adoption','Outside Admin Block','Near Main Gate','/uploads/nala.jpg','Nala is a gorgeous ragdoll cat who goes limp with affection when you pick her up.'],
        ['Raja','dog','German Shepherd',6,'Male','Needs treatment','Not vaccinated','Cannot be adopted','Outside Engineering Block','Next to Workshop','/uploads/Raja.avif','Raja is a senior shepherd being treated for arthritis. He deserves so much love.'],
        ['Maya','cat','Bombay',2,'Female','Healthy','Vaccinated','Up for adoption','Near Bus Stop','Ground Floor Garden','/uploads/placeholder.png','Maya is a sleek black cat with bright golden eyes. She is curious and playful.'],
        ['Cooper','dog','Dachshund',3,'Male','Healthy','Vaccinated','Up for adoption','Near Canteen','Next to Volleyball Court','/uploads/placeholder.png','Cooper the Dachshund is brave despite his short legs. He loves exploring every corner of campus.'],
        ['Ginger','cat','Maine Coon',2,'Female','Healthy','Vaccinated','Up for adoption','Behind Lecture Hall 2','At Chemistry Garden','/uploads/placeholder.png','Ginger is a fluffy Maine Coon who loves being brushed and sitting on laps during study sessions.'],
        ['Sparky','dog','Pug',2,'Male','Healthy','Vaccinated','Up for adoption','Near Old Library','Ground Floor Canopy','/uploads/placeholder.png','Sparky is the happiest pug on campus. His wrinkled face and curly tail will make your day.'],
        ['Buddy','dog','Golden Retriever',3,'Male','Healthy','Vaccinated','Up for adoption','Near Girls Hostel','Front of Hostel 7','/uploads/placeholder.png','Buddy is a certified good boy. He is trained, gentle, and absolutely loves children.'],
        ['Tiger','dog','Mixed',2,'Male','Healthy','Vaccinated','Up for adoption','Outside Admin','Near RO Plant','/uploads/placeholder.png','Tiger got his name for his bold stripes. He is playful, energetic, and loves tug-of-war.'],
        ['Zara','cat','Oriental',2,'Female','Healthy','Vaccinated','Up for adoption','Outside Workshop','Between Library and Block C','/uploads/placeholder.png','Zara is an elegant Oriental cat with large ears and a slim figure. Very affectionate.'],
        ['Juno','cat','Ragdoll',1,'Female','Healthy','Vaccinated','Up for adoption','Outside Exam Center','Near Main Library','/uploads/placeholder.png','Juno is a baby ragdoll kitten with the most striking blue eyes. She loves to cuddle.']
      ];
      const stmt = db.prepare(`INSERT INTO animals (name,species,breed,age,gender,health_status,vaccination_status,up_for_adoption,location_found,current_location,image_path,description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
      animals.forEach(a => stmt.run(a));
      stmt.finalize();
    }
  });

  // Seed donation drives
  db.get(`SELECT COUNT(*) as cnt FROM donation_drives`, [], (err, row) => {
    if (row && row.cnt === 0) {
      db.run(`INSERT INTO donation_drives (title, description, target_amount, raised_amount, photo, deadline, is_active) VALUES
        ('Emergency Vet Fund', 'Help us provide urgent medical care for injured and sick campus strays. Every rupee helps us cover vet bills, medicines, and emergency surgeries.', 50000, 18500, '/uploads/drive1.jpeg', '2026-06-30', 1),
        ('Campus Shelter Build', 'Help us build a proper shelter near the hostels where animals can rest safely, especially during monsoons and cold nights.', 80000, 31000, '/uploads/drive2.jpg', '2026-07-31', 1),
        ('Vaccination Drive 2026', 'Fund our annual vaccination camp to vaccinate 50+ campus animals against rabies and distemper. Protect animals and humans alike.', 25000, 9800, '/uploads/placeholder.png', '2026-05-15', 1)`);
    }
  });

  // Seed posts
  db.get(`SELECT COUNT(*) as cnt FROM posts`, [], (err, row) => {
    if (row && row.cnt === 0) {
      db.run(`INSERT INTO posts (user_id, title, content, date) VALUES
        (1, 'Welcome to CampusPaws! 🐾', 'We are thrilled to launch this platform to better care for our campus animals. Report strays, adopt, donate, and connect with fellow animal lovers!', datetime('now', '-5 days')),
        (1, 'Vaccination Camp Success!', 'Thanks to your generous donations, we successfully vaccinated 32 campus animals last weekend. A huge thank you to the volunteers and the veterinary team from Tezpur!', datetime('now', '-3 days')),
        (1, 'Found a litter near the library', 'Three tiny kittens were found behind the main library today. They are safe and being cared for. If you want to volunteer or adopt, please reach out through the platform.', datetime('now', '-1 day'))`);
    }
  });
});

module.exports = db;
