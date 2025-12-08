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
    
    // Create table
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
    
    console.log('Database connected and appointments table created');
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
