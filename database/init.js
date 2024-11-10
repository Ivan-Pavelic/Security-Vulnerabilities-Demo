const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/demo.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )`);

  db.run(`INSERT INTO users (username, password) VALUES ('admin', 'admin123')`);
  db.run(`INSERT INTO users (username, password) VALUES ('user', 'user123')`);
});

db.close();
console.log("Baza podataka inicijalizirana.");