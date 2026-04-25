const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcrypt');

async function getDb() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      source TEXT,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
    );
  `);

  // Create default admin user if not exists
  const user = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!user) {
    const hash = await bcrypt.hash('admin123', 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hash]);
  }

  // Insert dummy leads if empty
  const leadsCount = await db.get('SELECT COUNT(*) as count FROM leads');
  if (leadsCount.count === 0) {
    await db.run("INSERT INTO leads (name, email, source, status) VALUES ('John Doe', 'john@example.com', 'Website Form', 'new')");
    await db.run("INSERT INTO leads (name, email, source, status) VALUES ('Jane Smith', 'jane@example.com', 'Referral', 'contacted')");
    await db.run("INSERT INTO leads (name, email, source, status) VALUES ('Acme Corp', 'contact@acme.com', 'LinkedIn', 'converted')");
  }

  return db;
}

module.exports = { getDb };
