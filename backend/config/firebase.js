const admin = require('firebase-admin');
const path = require('path');

// Load .env file only in development (not on Render)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

console.log('Firebase Config Check:');
console.log('- PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing');
console.log('- CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✓ Set' : '✗ Missing');
console.log('- PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✓ Set' : '✗ Missing');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
