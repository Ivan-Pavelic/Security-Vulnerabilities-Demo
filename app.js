const express = require('express');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Povezivanje s bazom podataka
const db = new sqlite3.Database(':memory:');

// Stvaranje tablice i dodavanje testnih podataka
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
  db.run("INSERT INTO users (username, password) VALUES ('admin', 'adminpass')");
  db.run("INSERT INTO users (username, password) VALUES ('user', 'userpass')");
});

// Postavljanje sesije
app.use(session({
  secret: 'tajna_kljucna_rijec',
  resave: false,
  saveUninitialized: true
}));

// Parsiranje podataka iz tijela zahtjeva
app.use(express.urlencoded({ extended: true }));

// Postavljanje direktorija za statičke datoteke
app.use(express.static(path.join(__dirname, 'public')));

// Početna stranica
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta za SQL Injection
app.post('/sql-injection', (req, res) => {
  const username = req.body.username;
  const isVulnerable = req.body.vulnerability === 'enabled'; // Ranjivost je onemogućena prema zadanim postavkama

  if (isVulnerable) {
    // Ranjiva verzija SQL upita (SQL Injection ranjivost)
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    db.all(query, (err, rows) => {
      if (err) {
        res.send('Database error occurred.');
        return;
      }

      if (rows.length > 0) {
        res.send(`User found: ${JSON.stringify(rows)}`);
      } else {
        res.send('User not found.');
      }
    });
  } else {
    // Sigurna verzija SQL upita (bez SQL Injection ranjivosti)
    const query = `SELECT * FROM users WHERE username = ?`;
    db.all(query, [username], (err, rows) => {
      if (err) {
        res.send('Database error occurred.');
        return;
      }

      if (rows.length > 0) {
        res.send(`User found: ${JSON.stringify(rows)}`);
      } else {
        res.send('User not found.');
      }
    });
  }
});

app.post('/csrf', (req, res) => {
  const newStatus = req.body.status;

  // Ažuriraj `isVulnerable` stanje prema stanju checkboxa
  if (req.body.vulnerability === 'enabled') {
    req.session.isVulnerable = true;
  } else {
    req.session.isVulnerable = false; // Resetira na false kad checkbox nije označen
  }

  console.log('Postavljena vrijednost isVulnerable:', req.session.isVulnerable);

  const isVulnerable = req.session.isVulnerable;  // Dohvaćamo stanje direktno iz sesije
  console.log('Čitamo isVulnerable iz sesije prilikom provjere:', isVulnerable);

  if (isVulnerable) {
    // Ako je ranjivost omogućena, preskačemo provjeru CSRF tokena
    res.send(`Status successfully updated to: ${newStatus}`);
  } else {
    // Ako ranjivost NIJE omogućena, zahtijevamo CSRF token
    if (req.headers['csrf-token'] === '12345') {
      res.send(`Secure status successfully updated to: ${newStatus}`);
    } else {
      res.status(403).send('Invalid CSRF token. Access denied.');
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});