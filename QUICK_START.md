# Quick Start Guide - WFH Attendance System

## 🚀 Get Started in 5 Minutes

### Prerequisites
- PHP 8.2+ installed
- Composer installed
- Node.js 18+ installed
- PostgreSQL installed

---

## Step 1: Clone & Setup Backend (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env

# Configure database in .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=wfh_attendance
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Generate key
php artisan key:generate

# Run migrations and seed
php artisan migrate:fresh --seed

# Start server
php artisan serve
```

✅ Backend running on: **http://localhost:8000**

---

## Step 2: Setup Frontend (2 minutes)

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running on: **http://localhost:5173**

---

## Step 3: Login & Test (1 minute)

### Open Browser
Navigate to: **http://localhost:5173**

### Login Credentials

**Employee Account:**
```
Email: employee@example.com
Password: password123
```

**Manager Account:**
```
Email: manager@example.com
Password: password123
```

---

## 🎯 Quick Feature Test

### As Employee:
1. ✅ Login
2. ✅ Click "Check In"
3. ✅ Add tasks
4. ✅ View dashboard
5. ✅ Click "Check Out"
6. ✅ Mark task completion

### As Manager:
1. ✅ Login
2. ✅ View team dashboard
3. ✅ Navigate to "User Management"
4. ✅ Create new user
5. ✅ View "Activity Logs"

---

## 📁 Project Structure

```
WFH-Attendance-System/
├── backend/              # Laravel API
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── tests/
├── frontend/             # React App
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── public/
└── docs/                 # Documentation
```

---

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Create database if not exists
createdb wfh_attendance
```

**Port 8000 Already in Use:**
```bash
# Use different port
php artisan serve --port=8001
# Update frontend .env: VITE_API_URL=http://localhost:8001/api/v1
```

### Frontend Issues

**Port 5173 Already in Use:**
```bash
# Vite will automatically use next available port
# Or kill the process using port 5173
```

**API Connection Error:**
```bash
# Check backend is running
# Check .env file:
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 📚 Documentation

- **Full Documentation**: See `README.md`
- **API Documentation**: See `backend/API_DOCUMENTATION.md`
- **Testing Guide**: See `UI_TESTING_GUIDE.md`
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **Implementation Summary**: See `IMPLEMENTATION_SUMMARY.md`

---

## 🎓 Learn More

### Employee Features
- Check-in/Check-out with tasks
- View work reports
- Request leave
- Track daily progress

### Manager Features
- Team dashboard
- User management (CRUD)
- Leave approval
- Holiday management
- Activity logs

---

## 🆘 Need Help?

1. Check documentation files
2. Review `UI_TESTING_GUIDE.md` for detailed testing
3. Check console for errors (F12 in browser)
4. Review backend logs: `backend/storage/logs/laravel.log`

---

## ✅ Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Can login as employee
- [ ] Can login as manager
- [ ] Can check-in/check-out
- [ ] Can view reports
- [ ] No console errors

---

**You're all set! Start exploring the application! 🎉**

For detailed testing instructions, see: **`UI_TESTING_GUIDE.md`**
