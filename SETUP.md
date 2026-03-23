# 🚀 Quick Setup Guide

## Step 1: Install Node.js (if not already installed)

Download and install from: https://nodejs.org/
- Choose LTS version (recommended)
- Verify installation: Open terminal/command prompt and type:
  ```bash
  node --version
  npm --version
  ```

## Step 2: Set Up the Project

1. **Create a project folder**
   ```bash
   mkdir aurum-payroll
   cd aurum-payroll
   ```

2. **Copy these files into the folder:**
   - `server.js` (backend)
   - `package.json` (dependencies)
   - `index.html` (frontend)
   - `README.md` (documentation)

3. **Install dependencies**
   ```bash
   npm install
   ```
   This will install: express, sqlite3, bcryptjs, jsonwebtoken, cors

## Step 3: Start the Backend Server

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════╗
║   🏆 AURUM PAYROLL BACKEND SERVER          ║
║                                            ║
║   Server running on: http://localhost:3000 ║
║   API endpoint: http://localhost:3000/api  ║
║                                            ║
║   Default Login:                           ║
║   Email: admin@aurum.io                    ║
║   Password: admin123                       ║
╚════════════════════════════════════════════╝
```

## Step 4: Open the Frontend

### Option A: Simple (Double-click)
- Just double-click `index.html` in your file explorer
- It will open in your default browser

### Option B: Local Server (Recommended)
```bash
# In a NEW terminal window (keep server running in first one)
npx http-server -p 8080
```
Then open: http://localhost:8080

## Step 5: Login and Test

1. **Login with:**
   - Email: `admin@aurum.io`
   - Password: `admin123`

2. **Try these features:**
   - Toggle dark/light mode (top-right button)
   - Add a new employee
   - Add a new department
   - View the dashboard stats
   - Test on mobile (resize browser window)

## Step 6: Customize

### Add Your Name in Footer
Edit `index.html`, find:
```html
<span>Built with ♥ by <a href="#" class="footer-link">Your Name</a></span>
```
Replace "Your Name" with your actual name and add your portfolio/LinkedIn link.

### Change Colors (Optional)
In `index.html`, find the `:root` section around line 50 and modify the color variables.

## 🎯 What to Show Recruiters

### 1. Live Demo Points
- "This is a full-stack application I built from scratch"
- "It has real authentication with JWT tokens"
- "The database persists data between sessions"
- "It's fully responsive - watch it work on mobile"
- "I implemented dark/light mode with theme persistence"

### 2. Code Walkthrough
Be ready to explain:
- **Authentication flow**: Login → JWT → Protected routes
- **API architecture**: RESTful endpoints with proper HTTP methods
- **Database design**: Normalized schema with foreign keys
- **Frontend state**: How data flows from API to UI
- **Responsive design**: CSS Grid/Flexbox without frameworks

### 3. Technical Decisions
"I chose [technology] because..."
- JWT: Stateless auth scales better than sessions
- SQLite: Fast development, easy to migrate to PostgreSQL
- Vanilla JS: Demonstrates core JavaScript skills
- Express: Industry-standard Node.js framework

## 🚨 Common Issues & Fixes

### Issue: "Cannot find module 'express'"
**Fix:** Run `npm install` in the project folder

### Issue: "Port 3000 already in use"
**Fix:** 
- Change port in `server.js`: `const PORT = 3001;`
- Update `index.html` API_URL: `const API_URL = 'http://localhost:3001/api';`

### Issue: "Connection error" when logging in
**Fix:** Make sure the backend server is running (`npm start`)

### Issue: Dark mode not working
**Fix:** Your browser may not support CSS custom properties. Try Chrome or Firefox.

## 📱 Mobile Testing

1. **Get your computer's local IP:**
   - Windows: `ipconfig` (look for IPv4)
   - Mac/Linux: `ifconfig` or `ip addr`

2. **Update API URL in index.html:**
   ```javascript
   const API_URL = 'http://192.168.1.XXX:3000/api';
   ```
   Replace XXX with your actual IP

3. **Open on phone:**
   ```
   http://192.168.1.XXX:8080
   ```

## 🌐 Deploy to Production

### Quick Deploy to Render (Free)

1. **Create GitHub repo:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Go to render.com:**
   - Sign up/Login
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Click "Create Web Service"

3. **Deploy Frontend:**
   - Go to render.com
   - Click "New +" → "Static Site"
   - Connect same repo
   - Publish directory: `.` (root)
   - Click "Create Static Site"

4. **Update API URL:**
   - In `index.html`, change:
   ```javascript
   const API_URL = 'https://your-backend-url.onrender.com/api';
   ```
   - Commit and push

Your app is now live! 🎉

## 📝 Checklist Before Showing to Recruiters

- [ ] Backend server starts without errors
- [ ] Can login with demo credentials
- [ ] Can add new employee
- [ ] Can add new department
- [ ] Dark/light mode toggle works
- [ ] Responsive on mobile (test with browser dev tools)
- [ ] Footer has your name
- [ ] No console errors
- [ ] GitHub repo has good README
- [ ] Live demo link (if deployed)

## 🎤 Practice Your Demo

**30-Second Pitch:**
"I built a full-stack payroll management system with Node.js, Express, and vanilla JavaScript. It features JWT authentication, a RESTful API with CRUD operations, and a responsive UI with dark/light mode. The backend uses SQLite with proper data relationships, and the frontend is mobile-friendly without any frameworks. I deployed it to [platform] and it's handling user authentication and data persistence."

**2-Minute Deep Dive:**
1. Show login and authentication (30s)
2. Dashboard - explain the stats API calls (20s)
3. Add employee - show form validation and API integration (30s)
4. Toggle dark/light mode (10s)
5. Show mobile responsive (20s)
6. Briefly mention backend architecture (10s)

## Need Help?

- Check server logs in the terminal
- Open browser DevTools → Console for frontend errors
- Read error messages carefully - they usually tell you what's wrong
- Google the error message if stuck

---

**You're ready to impress! 🌟**

Remember: Confidence comes from understanding your code. Review the files, understand what each part does, and be ready to explain your decisions.
