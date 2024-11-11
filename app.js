const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.connect().catch(console.error);

redisClient.set("testKey", "testValue", (err, reply) => {
  if (err) console.error("Redis set error:", err);
  else console.log("Redis set reply:", reply);
});

redisClient.get("testKey", (err, reply) => {
  if (err) console.error("Redis get error:", err);
  else console.log("Redis get reply:", reply);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'tajna_kljucna_rijec',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'false ' }
}));
app.use((req, res, next) => {
  if (req.session.isVulnerable === undefined) {
    req.session.isVulnerable = false;
  }
  next();
});

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

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

  if (req.body.vulnerability !== undefined) {
    req.session.isVulnerable = req.body.vulnerability === 'enabled';
  }
  
  req.session.lastStatus = newStatus;

  const isVulnerable = req.session.isVulnerable || false;

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

app.get('/csrf', (req, res) => {
  const lastStatus = req.session.lastStatus || '';
  const isVulnerable = req.session.isVulnerable || false;

  res.send(`
    <html>
      <head>
        <title>CSRF Demo</title>
      </head>
      <body>
        <h2>CSRF Demo</h2>
        <form action="/csrf" method="POST">
          <label for="status">New User Status:</label>
          <input type="text" id="status" name="status" value="${lastStatus}">
          <br><br>
          <label for="vulnerability">Enable CSRF Vulnerability:</label>
          <input type="checkbox" id="vulnerability" name="vulnerability" value="enabled" ${isVulnerable ? 'checked' : ''}>
          <br><br>
          <button type="submit">Update Status</button>
        </form>
      </body>
    </html>
  `);
});