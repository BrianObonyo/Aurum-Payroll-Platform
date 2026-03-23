# 🏆 Aurum Payroll Platform - Full Stack Project

A premium, enterprise-grade payroll management system built with modern web technologies.

![Version](https://img.shields.io/badge/version-1.0.0-gold)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Features

### ✅ Authentication & Security
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected API routes
- Session management

### ✅ Full CRUD Operations
- Employee management (Create, Read, Update, Delete)
- Department management
- Payslip generation
- Real-time data updates

### ✅ Modern UI/UX
- **Dark/Light Mode** - Toggle between themes
- **Fully Responsive** - Works on mobile, tablet, and desktop
- Premium design with gold accents
- Smooth animations and transitions
- Professional typography

### ✅ Backend API
- RESTful API architecture
- SQLite database
- Real authentication system
- Data persistence
- Error handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Clone or download this project**

2. **Install dependencies**
```bash
npm install
```

3. **Start the backend server**
```bash
npm start
```

The server will start on `http://localhost:3000`

4. **Open the frontend**
- Open `index.html` in your browser
- Or use a local server: `npx http-server -p 8080`

5. **Login with default credentials**
```
Email: admin@aurum.io
Password: admin123
```

## 📁 Project Structure

```
aurum-payroll/
├── server.js           # Backend API server
├── package.json        # Dependencies
├── index.html          # Frontend application
├── aurum_payroll.db    # SQLite database (auto-created)
└── README.md          # This file
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department

### Dashboard
- `GET /api/stats/dashboard` - Get dashboard statistics

## 🎨 Features Breakdown

### 🌓 Dark/Light Mode
Click the theme toggle button in the top-right corner to switch between dark and light themes. Theme preference is saved in localStorage.

### 📱 Mobile Responsive
- Hamburger menu on mobile devices
- Touch-friendly buttons
- Optimized layouts for all screen sizes
- Collapsible sidebar

### 🔐 Authentication Flow
1. User enters credentials
2. Backend validates and generates JWT token
3. Token stored in localStorage
4. All API requests include Authorization header
5. Auto-logout on token expiration

