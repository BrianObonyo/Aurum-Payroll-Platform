const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize SQLite Database
const db = new sqlite3.Database('./aurum_payroll.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✓ Connected to SQLite database');
    initializeDatabase();
  }
});

// Create tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Employees table
    db.run(`CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_id TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      position TEXT NOT NULL,
      basic_salary REAL NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Departments table
    db.run(`CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      head TEXT,
      budget REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Payslips table
    db.run(`CREATE TABLE IF NOT EXISTS payslips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slip_id TEXT UNIQUE NOT NULL,
      employee_id INTEGER NOT NULL,
      period_month TEXT NOT NULL,
      period_year INTEGER NOT NULL,
      basic_salary REAL NOT NULL,
      allowances REAL DEFAULT 0,
      deductions REAL DEFAULT 0,
      net_pay REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )`);

    // Create default admin user
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (email, password, first_name, last_name, role) 
            VALUES ('admin@aurum.io', ?, 'Admin', 'User', 'super_admin')`, 
            [defaultPassword], (err) => {
      if (!err) {
        console.log('✓ Default admin user created (email: admin@aurum.io, password: admin123)');
      }
    });

    // Insert sample data
    insertSampleData();
  });
}

function insertSampleData() {
  const departments = [
    ['Engineering', 'Marcus Kim', 85000],
    ['Sales', 'James Donovan', 120000],
    ['Operations', 'Sofia Reyes', 95000],
    ['Finance', 'Amara Leke', 78000],
    ['HR', 'Priya Lal', 65000]
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO departments (name, head, budget) VALUES (?, ?, ?)');
  departments.forEach(dept => stmt.run(dept));
  stmt.finalize();

  const employees = [
    ['EMP-001', 'James', 'Donovan', 'james.donovan@aurum.io', 'Sales', 'Senior Sales Manager', 5200],
    ['EMP-002', 'Sofia', 'Reyes', 'sofia.reyes@aurum.io', 'Operations', 'Operations Lead', 4800],
    ['EMP-003', 'Marcus', 'Kim', 'marcus.kim@aurum.io', 'Engineering', 'Lead Software Engineer', 5800],
    ['EMP-004', 'Anya', 'Chen', 'anya.chen@aurum.io', 'Engineering', 'Frontend Developer', 4500],
    ['EMP-005', 'Amara', 'Leke', 'amara.leke@aurum.io', 'Finance', 'Financial Analyst', 4200],
    ['EMP-006', 'Priya', 'Lal', 'priya.lal@aurum.io', 'HR', 'HR Specialist', 3900]
  ];

  const empStmt = db.prepare('INSERT OR IGNORE INTO employees (emp_id, first_name, last_name, email, department, position, basic_salary) VALUES (?, ?, ?, ?, ?, ?, ?)');
  employees.forEach(emp => empStmt.run(emp));
  empStmt.finalize();
}

// ==================== AUTH MIDDLEWARE ====================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ==================== AUTH ROUTES ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(`INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, first_name, last_name],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        res.status(201).json({ 
          message: 'User registered successfully',
          userId: this.lastID 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?', 
    [req.user.id], 
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// ==================== EMPLOYEE ROUTES ====================

// Get all employees
app.get('/api/employees', authenticateToken, (req, res) => {
  db.all('SELECT * FROM employees WHERE status = "active" ORDER BY created_at DESC', 
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch employees' });
      }
      res.json(rows);
    }
  );
});

// Get single employee
app.get('/api/employees/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM employees WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch employee' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(row);
  });
});

// Create employee
app.post('/api/employees', authenticateToken, (req, res) => {
  const { first_name, last_name, email, department, position, basic_salary } = req.body;
  
  // Generate employee ID
  db.get('SELECT COUNT(*) as count FROM employees', (err, result) => {
    const empId = `EMP-${String(result.count + 1).padStart(3, '0')}`;
    
    db.run(`INSERT INTO employees (emp_id, first_name, last_name, email, department, position, basic_salary) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [empId, first_name, last_name, email, department, position, basic_salary],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Failed to create employee' });
        }
        res.status(201).json({ 
          message: 'Employee created successfully',
          id: this.lastID,
          emp_id: empId
        });
      }
    );
  });
});

// Update employee
app.put('/api/employees/:id', authenticateToken, (req, res) => {
  const { first_name, last_name, email, department, position, basic_salary } = req.body;
  
  db.run(`UPDATE employees 
          SET first_name = ?, last_name = ?, email = ?, department = ?, position = ?, basic_salary = ?
          WHERE id = ?`,
    [first_name, last_name, email, department, position, basic_salary, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update employee' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json({ message: 'Employee updated successfully' });
    }
  );
});

// Delete employee (soft delete)
app.delete('/api/employees/:id', authenticateToken, (req, res) => {
  db.run('UPDATE employees SET status = "inactive" WHERE id = ?', 
    [req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete employee' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json({ message: 'Employee deleted successfully' });
    }
  );
});

// ==================== DEPARTMENT ROUTES ====================

app.get('/api/departments', authenticateToken, (req, res) => {
  db.all('SELECT * FROM departments ORDER BY name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch departments' });
    }
    res.json(rows);
  });
});

app.post('/api/departments', authenticateToken, (req, res) => {
  const { name, head, budget } = req.body;
  
  db.run('INSERT INTO departments (name, head, budget) VALUES (?, ?, ?)',
    [name, head, budget],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ error: 'Department already exists' });
        }
        return res.status(500).json({ error: 'Failed to create department' });
      }
      res.status(201).json({ 
        message: 'Department created successfully',
        id: this.lastID
      });
    }
  );
});

// ==================== PAYSLIP ROUTES ====================

app.get('/api/payslips', authenticateToken, (req, res) => {
  const query = `
    SELECT p.*, e.first_name, e.last_name, e.department, e.position
    FROM payslips p
    JOIN employees e ON p.employee_id = e.id
    ORDER BY p.created_at DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch payslips' });
    }
    res.json(rows);
  });
});

// ==================== DASHBOARD STATS ====================

app.get('/api/stats/dashboard', authenticateToken, (req, res) => {
  const stats = {};
  
  db.get('SELECT COUNT(*) as total FROM employees WHERE status = "active"', (err, result) => {
    stats.totalEmployees = result?.total || 0;
    
    db.get('SELECT COUNT(*) as total FROM departments', (err, result) => {
      stats.totalDepartments = result?.total || 0;
      
      db.get('SELECT SUM(basic_salary) as total FROM employees WHERE status = "active"', (err, result) => {
        stats.totalPayroll = result?.total || 0;
        
        res.json(stats);
      });
    });
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🏆 AURUM PAYROLL BACKEND SERVER          ║
║                                            ║
║   Server running on: http://localhost:${PORT}  ║
║   API endpoint: http://localhost:${PORT}/api    ║
║                                            ║
║   Default Login:                           ║
║   Email: admin@aurum.io                    ║
║   Password: admin123                       ║
╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('\n✓ Database connection closed');
    process.exit(0);
  });
});
