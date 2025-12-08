const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1', // Changed from 'localhost' to '127.0.0.1'
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 3306
};

let pool;

// Initialize database connection
async function initDB() {
  try {
    // First connect without database to create it if needed
    const connection = await mysql.createConnection(dbConfig);
    
    const dbName = process.env.DB_NAME || 'appointment_booking';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.end();
    
    // Now create pool with the database
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Create tables
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        service VARCHAR(255) NOT NULL,
        notes TEXT,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create default admin user if not exists
    const [adminCheck] = await pool.execute('SELECT * FROM users WHERE email = ?', ['admin@appointment.com']);
    if (adminCheck.length === 0) {
      await pool.execute(
        'INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)',
        ['Admin', 'User', 'admin@appointment.com', '1234567890', 'admin123', 'admin']
      );
      console.log('Default admin user created - Email: admin@appointment.com, Password: admin123');
    }
    
    console.log('Database connected and tables created');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('\nPlease ensure:');
    console.error('1. MySQL is installed and running');
    console.error('2. MySQL credentials are correct');
    console.error('3. Run: sudo systemctl start mysql (Linux) or brew services start mysql (Mac)');
    process.exit(1);
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Authentication Routes
// POST register
app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;
  
  if (!firstName || !lastName || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Check if user already exists
    const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Insert new user (in production, hash the password!)
    await pool.execute(
      'INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, phone, password, 'user']
    );
    
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // In production, generate a proper JWT token
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');
    
    res.json({ 
      token, 
      role: user.role,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM appointments ORDER BY appointment_date DESC, appointment_time DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST new appointment
app.post('/api/appointments', async (req, res) => {
  const { customer_name, customer_email, customer_phone, appointment_date, appointment_time, service, notes } = req.body;
  
  if (!customer_name || !customer_email || !customer_phone || !appointment_date || !appointment_time || !service) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO appointments (customer_name, customer_email, customer_phone, appointment_date, appointment_time, service, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer_name, customer_email, customer_phone, appointment_date, appointment_time, service, notes || '']
    );
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Appointment booked successfully' 
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// PUT update appointment
app.put('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { customer_name, customer_email, customer_phone, appointment_date, appointment_time, service, notes, status } = req.body;

  if (!customer_name || !customer_email || !customer_phone || !appointment_date || !appointment_time || !service) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE appointments SET customer_name = ?, customer_email = ?, customer_phone = ?, appointment_date = ?, appointment_time = ?, service = ?, notes = ?, status = ? WHERE id = ?',
      [customer_name, customer_email, customer_phone, appointment_date, appointment_time, service, notes || '', status || 'pending', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// PATCH update appointment status
app.patch('/api/appointments/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Valid status is required' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment status updated successfully' });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

// DELETE appointment
app.delete('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM appointments WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the appointment booking system`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  if (pool) await pool.end();
  process.exit(0);
});

startServer();
