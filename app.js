const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const { createClient } = require('redis');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;
let redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL
  );
`)
.then(() => {
  return pool.query(`
    INSERT INTO users (username, password)
    VALUES ('admin', 'adminpass'), ('user', 'userpass')
    ON CONFLICT (username) DO NOTHING;
  `);
})
.catch(err => console.error('Error creating table:', err));

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'tajna_kljucna_rijec',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/sql-injection', (req, res) => {
  const username = req.body.username;
  const isVulnerable = req.body.vulnerability === 'enabled';

  const query = isVulnerable
    ? `SELECT * FROM users WHERE username = '${username}'`
    : `SELECT * FROM users WHERE username = $1`;

  const values = isVulnerable ? [] : [username];

  pool.query(query, values)
    .then(result => {
      if (result.rows.length > 0) {
        res.send(`User found: ${JSON.stringify(result.rows)}`);
      } else {
        res.send('User not found.');
      }
    })
    .catch(err => {
      console.error('Database error:', err);
      res.send('Database error occurred.');
    });
});

app.post('/csrf', (req, res) => {
  const newStatus = req.body.status;

  if (req.body.vulnerability === 'enabled') {
    req.session.isVulnerable = true;
  } else {
    req.session.isVulnerable = false;
  }

  console.log('Postavljena vrijednost isVulnerable:', req.session.isVulnerable);

  const isVulnerable = req.session.isVulnerable;
  console.log('Čitamo isVulnerable iz sesije prilikom provjere:', isVulnerable);

  if (isVulnerable) {
    res.send(`Status successfully updated to: ${newStatus}`);
  } else {
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