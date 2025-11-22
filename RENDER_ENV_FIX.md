# URGENT: Fix Render Environment Variables

## The Problem
The backend is timing out because Firebase environment variables are missing or incorrect in Render.

## How to Fix

### 1. Go to Render Dashboard
https://dashboard.render.com

### 2. Select Your Backend Service
Click on `set-cam` (your backend service)

### 3. Click "Environment" in Left Sidebar

### 4. Add/Verify These Environment Variables

**CRITICAL - Copy from Firebase Service Account JSON file:**

Open: `C:\Users\chest\Downloads\SET CAM\set-cam-firebase-adminsdk-fbsvc-e27fa4ae24.json`

Then add these in Render:

```
FIREBASE_PROJECT_ID
Value: set-cam

FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-fbsvc@set-cam.iam.gserviceaccount.com

FIREBASE_PRIVATE_KEY
Value: (Copy the ENTIRE private_key from the JSON file, including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)
IMPORTANT: Keep the \n characters in the key - don't replace them with actual newlines

FIREBASE_DATABASE_URL
Value: https://set-cam.firebaseio.com
```

**OPTIONAL - For Email (SMTP):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=(your Gmail address)
SMTP_PASS=qhpgippjkpjzkjgb
```

**OTHER SETTINGS:**
```
NODE_ENV=production
PORT=10000
```

### 5. Save Changes
Click "Save Changes" button at the bottom

### 6. Wait for Render to Redeploy
Render will automatically redeploy with the new environment variables (takes 1-2 minutes)

### 7. Test the Backend
After deployment, test:
```
curl https://set-cam.onrender.com/api/health/full
```

You should see:
```json
{
  "server": "OK",
  "firebase": "Connected",
  "timestamp": "2025-11-22T..."
}
```

## If Backend Logs Show Errors

Go to Render → Logs tab and look for:
- `❌ CRITICAL: Missing Firebase environment variables!`
- `✓ Firebase Admin SDK initialized successfully`

The logs will tell you exactly what's missing.

## Common Issues

1. **FIREBASE_PRIVATE_KEY has no \n characters**
   - Make sure to copy it EXACTLY from the JSON file
   - Should look like: `"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA..."`

2. **FIREBASE_CLIENT_EMAIL is wrong**
   - Should be: `firebase-adminsdk-fbsvc@set-cam.iam.gserviceaccount.com`

3. **FIREBASE_PROJECT_ID is wrong**
   - Should be: `set-cam`

## After Fixing

Once environment variables are correct:
1. Backend will start successfully
2. OTP system will work
3. Registration will complete without timeout errors
4. Website at https://set-cam.web.app will work properly
