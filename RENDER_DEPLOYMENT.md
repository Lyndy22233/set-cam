# RENDER.COM DEPLOYMENT GUIDE

## Step 1: Get Firebase Service Account Key

1. Go to Firebase Console: https://console.firebase.google.com/project/set-cam/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Download the JSON file (keep it safe, don't share it!)
4. Open the JSON file and note these values:
   - `project_id`
   - `private_key` (entire key including -----BEGIN PRIVATE KEY----- etc)
   - `client_email`

## Step 2: Push Code to GitHub

```bash
# Initialize Git repository
cd "C:\Users\chest\Downloads\SET CAM"
git init
git add .
git commit -m "Initial commit - SET CAM deployment"

# Create a new GitHub repository at https://github.com/new
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/set-cam.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Render.com

1. Go to https://render.com and sign up (free, no credit card required)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select the `set-cam` repository
5. Configure the service:
   - **Name**: set-cam-api
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
6. Click "Advanced" and add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render sets this automatically)
   - `FIREBASE_PROJECT_ID` = `set-cam`
   - `FIREBASE_PRIVATE_KEY` = (paste the entire private key from JSON file)
   - `FIREBASE_CLIENT_EMAIL` = (paste client_email from JSON file)
   - `FIREBASE_DATABASE_URL` = `https://set-cam.firebaseio.com`

7. Click "Create Web Service"
8. Wait 2-5 minutes for deployment to complete
9. Copy your service URL (e.g., `https://set-cam-api.onrender.com`)

## Step 4: Update Frontend API URL

1. Open `frontend/.env.production`
2. Update `REACT_APP_API_URL` to your Render URL + `/api`:
   ```
   REACT_APP_API_URL=https://set-cam-api.onrender.com/api
   ```

## Step 5: Rebuild and Redeploy Frontend

```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

## Step 6: Create Firestore Index

Click this link to create the required index:
https://console.firebase.google.com/project/set-cam/firestore/indexes

Or click the link from your browser console error.

## Done! 🎉

Your app will be live at: https://set-cam.web.app

**Note about Render Free Tier:**
- Your backend will "sleep" after 15 minutes of inactivity
- First request after sleep will take 30-60 seconds to wake up
- This is normal for free tier - users just need to wait a bit on first load
- To avoid this, upgrade to Render's paid plan ($7/month) or use Firebase Functions with Blaze plan

## Troubleshooting

**Error: FIREBASE_PRIVATE_KEY format**
Make sure to paste the ENTIRE private key including the BEGIN/END lines:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhki...
...
-----END PRIVATE KEY-----
```

**Error: Connection refused**
- Check that your Render service is running (green status)
- Verify the API URL in frontend/.env.production is correct
- Check Render logs for errors

**Backend crashes on Render**
- Check Render logs for errors
- Verify all environment variables are set correctly
- Make sure Firebase credentials are valid
