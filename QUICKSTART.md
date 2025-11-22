# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js installed
- Firebase account created
- Git (optional)

### Step 1: Firebase Setup (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (name it anything you like)
3. Enable these services:
   - **Authentication** → Enable Email/Password
   - **Firestore Database** → Create database (Start in test mode)
   - **Storage** → Create storage bucket

4. Get Web Configuration:
   - Click ⚙️ (Settings) → Project Settings
   - Scroll to "Your apps" → Click Web icon (</>)
   - Copy the configuration object

5. Get Admin SDK Key:
   - Project Settings → Service Accounts
   - Click "Generate New Private Key" → Download JSON

### Step 2: Backend Setup (2 minutes)

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your Firebase credentials
notepad .env  # Windows
# or
nano .env     # Mac/Linux
```

Add your Firebase Admin credentials:
```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

Start the backend:
```bash
npm start
```

### Step 3: Frontend Setup (2 minutes)

Open a new terminal:

```bash
cd frontend

# Copy environment template
cp .env.example .env

# Edit .env with your Firebase web config
notepad .env  # Windows
# or
nano .env     # Mac/Linux
```

Add your Firebase configuration:
```env
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

### Step 4: Initial Data Setup (1 minute)

In the backend terminal:

```bash
# Seed initial services
node scripts/seedServices.js
```

### Step 5: Create Admin User (2 minutes)

1. Open the app at `http://localhost:3000`
2. Click "Register" and create an account
3. In backend terminal, run:
```bash
node scripts/setAdmin.js your-email@example.com
```
4. Log out and log back in

### Step 6: Test the System

✅ **User Flow:**
1. Register/Login
2. Browse Services
3. Book an Appointment
4. Upload Payment Receipt
5. Check "My Appointments"

✅ **Admin Flow:**
1. Login with admin account
2. Go to `/admin/dashboard`
3. View appointments
4. Approve/Reject appointments
5. Add test results

## 🎯 What's Next?

### Customize Services
Edit `backend/scripts/seedServices.js` and run it again to update services.

### Configure Firebase Rules
Update Firestore and Storage rules in Firebase Console for production.

### Deploy
- Frontend: Deploy to Vercel, Netlify, or Firebase Hosting
- Backend: Deploy to Heroku, Railway, or Google Cloud Run

## 🆘 Need Help?

### Common Issues

**"Module not found" error**
```bash
npm install
```

**"Port already in use"**
Change PORT in backend/.env to another port (e.g., 5001)

**"Firebase configuration error"**
Double-check your .env files and ensure all values are correct

**Can't access admin dashboard**
Make sure you ran the setAdmin script and logged out/in

### Firebase Console Quick Links
- Authentication: `https://console.firebase.google.com/project/YOUR_PROJECT/authentication`
- Firestore: `https://console.firebase.google.com/project/YOUR_PROJECT/firestore`
- Storage: `https://console.firebase.google.com/project/YOUR_PROJECT/storage`

## 📚 Resources

- [Full README](../README.md) - Complete documentation
- [Firebase Docs](https://firebase.google.com/docs)
- [React Docs](https://react.dev/)
- [Express Docs](https://expressjs.com/)

---

**Happy Testing! 🎉**
