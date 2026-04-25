const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'super-secret-key'; // In production, use environment variable

app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Start Server and setup routes
async function startServer() {
  const db = await getDb();

  // Login
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  // Get all leads
  app.get('/api/leads', authenticateToken, async (req, res) => {
    const leads = await db.all('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(leads);
  });

  // Create a new lead (public endpoint for website forms)
  app.post('/api/leads', async (req, res) => {
    const { name, email, source } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    try {
      const result = await db.run(
        'INSERT INTO leads (name, email, source) VALUES (?, ?, ?)',
        [name, email, source || 'Website']
      );
      res.status(201).json({ id: result.lastID, name, email, source, status: 'new' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create lead' });
    }
  });

  // Update lead status
  app.put('/api/leads/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['new', 'contacted', 'converted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.run('UPDATE leads SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, status });
  });

  // Get notes for a lead
  app.get('/api/leads/:id/notes', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const notes = await db.all('SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at DESC', [id]);
    res.json(notes);
  });

  // Add a note to a lead
  app.post('/api/leads/:id/notes', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) return res.status(400).json({ error: 'Note content is required' });

    const result = await db.run('INSERT INTO notes (lead_id, content) VALUES (?, ?)', [id, content]);
    const newNote = await db.get('SELECT * FROM notes WHERE id = ?', [result.lastID]);
    res.status(201).json(newNote);
  });

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
