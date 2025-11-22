# Environment Configuration Guide

This guide helps you configure the environment variables for both frontend and backend.

## 📋 Required Information

Before you begin, gather these from your Firebase project:

### From Firebase Console → Project Settings → General

1. **Web App Configuration** (for frontend)
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

### From Firebase Console → Project Settings → Service Accounts

2. **Admin SDK Configuration** (for backend)
   - Project ID
   - Private Key (from downloaded JSON)
   - Client Email (from downloaded JSON)

---

## 🎨 Frontend Configuration

**File:** `frontend/.env`

### Step 1: Copy the example file
```bash
cd frontend
cp .env.example .env
```

### Step 2: Edit the .env file

```env
# Firebase Web Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api
```

### Where to find each value:

1. Go to Firebase Console
2. Select your project
3. Click ⚙️ Settings → Project Settings
4. Scroll to "Your apps" section
5. If no web app exists:
   - Click the web icon (</>)
   - Register your app
6. Copy each config value

**Important:** 
- For production, change `REACT_APP_API_URL` to your deployed backend URL
- Never commit the actual `.env` file to git (it's in .gitignore)

---

## ⚙️ Backend Configuration

**File:** `backend/.env`

### Step 1: Copy the example file
```bash
cd backend
cp .env.example .env
```

### Step 2: Get Firebase Admin SDK Key

1. Go to Firebase Console
2. Select your project
3. Click ⚙️ Settings → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Download the JSON file (save it securely!)

### Step 3: Edit the .env file

```env
# Server Configuration
PORT=5000

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...[long key here]...==\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

### Where to find each value:

Open the downloaded JSON file (serviceAccountKey.json):

```json
{
  "type": "service_account",
  "project_id": "your-project-id",           ← FIREBASE_PROJECT_ID
  "private_key": "-----BEGIN PRIVATE KEY-----...", ← FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-...",   ← FIREBASE_CLIENT_EMAIL
  // ... other fields
}
```

**Important Notes:**

1. **Private Key Format:**
   - Must include the quotes around the key
   - Keep the `\n` characters (they represent line breaks)
   - Copy the ENTIRE key including BEGIN and END markers

2. **Database URL:**
   - Format: `https://your-project-id.firebaseio.com`
   - Replace `your-project-id` with your actual Firebase project ID

3. **Security:**
   - Never commit this file to git
   - Never share your private key
   - Keep the JSON file in a secure location

---

## 🔍 Verification

### Check Frontend Configuration

1. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

2. Open browser console (F12)
3. You should NOT see Firebase configuration errors
4. Try to register a user - if successful, config is correct

### Check Backend Configuration

1. Start the backend:
   ```bash
   cd backend
   npm start
   ```

2. Look for:
   ```
   Server is running on port 5000
   ```

3. Test the health endpoint:
   ```bash
   curl http://localhost:5000/api/health
   ```
   
   Should return:
   ```json
   {"status":"OK","message":"Server is running"}
   ```

---

## ❌ Common Configuration Errors

### Frontend Errors

**Error:** `Firebase: Error (auth/invalid-api-key)`
- **Solution:** Check `REACT_APP_FIREBASE_API_KEY` is correct

**Error:** `Firebase: Error (auth/project-not-found)`
- **Solution:** Check `REACT_APP_FIREBASE_PROJECT_ID` is correct

**Error:** Network request failed
- **Solution:** Check `REACT_APP_API_URL` points to running backend

### Backend Errors

**Error:** `Error: Failed to parse private key`
- **Solution:** Check `FIREBASE_PRIVATE_KEY` format
- Ensure quotes are present: `"-----BEGIN..."`
- Keep the `\n` characters

**Error:** `Error: Credential implementation provided to initializeApp() via the "credential" property failed`
- **Solution:** One of the Firebase credentials is incorrect
- Re-download the service account key and try again

**Error:** `EADDRINUSE: address already in use :::5000`
- **Solution:** Port 5000 is busy
- Change `PORT=5001` in backend `.env`
- Update frontend `REACT_APP_API_URL` accordingly

---

## 🚀 Production Configuration

### Frontend (Production)

Update these values:

```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### Backend (Production)

Update these values:

```env
PORT=5000  # or whatever port your hosting provider uses
NODE_ENV=production
```

Add allowed origins for CORS in `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'https://your-frontend-domain.com',
    'http://localhost:3000'  // for local development
  ]
}));
```

---

## 📝 Configuration Checklist

### Frontend Setup
- [ ] Created `frontend/.env` file
- [ ] Added all 7 Firebase configuration values
- [ ] Set API URL to backend server
- [ ] Values match Firebase console
- [ ] Tested with `npm start`

### Backend Setup
- [ ] Created `backend/.env` file
- [ ] Downloaded Firebase Admin SDK JSON
- [ ] Copied project_id correctly
- [ ] Copied private_key with proper format
- [ ] Copied client_email correctly
- [ ] Set database URL
- [ ] Tested with `npm start`

### Verification
- [ ] Backend health check returns OK
- [ ] Frontend loads without errors
- [ ] Can register a new user
- [ ] Can login with created user
- [ ] Can view services page

---

## 🆘 Still Having Issues?

1. **Double-check each value** - one typo can break everything
2. **Check Firebase Console** - ensure services are enabled:
   - Authentication → Email/Password enabled
   - Firestore Database → Created
   - Storage → Initialized
3. **Review error messages** - they usually point to the specific problem
4. **Compare with example files** - ensure format matches
5. **Try with fresh Firebase project** - rules out project-specific issues

---

## 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Environment Variables in React](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Node.js dotenv](https://www.npmjs.com/package/dotenv)

---

**Remember:** Keep your `.env` files secure and never commit them to version control!
