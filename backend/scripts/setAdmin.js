const { admin, db } = require('../config/firebase');

/**
 * Script to set admin role in Firestore
 * Usage: node scripts/setAdmin.js user@example.com
 */

async function setAdminRole(email) {
  try {
    console.log(`Setting admin role for: ${email}`);
    
    // Get user from Firebase Auth
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${user.email} (${user.uid})`);
    
    // Update role in Firestore
    await db.collection('users').doc(user.uid).set({
      role: 'admin',
      email: user.email,
      displayName: user.displayName || 'Admin User',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log('✓ Admin role successfully set in Firestore!');
    console.log(`User: ${user.email} (${user.uid})`);
    console.log('\nNote: User should refresh the page to see admin menu.');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error setting admin role:', error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.log('Usage: node scripts/setAdmin.js user@example.com');
  process.exit(1);
}

setAdminRole(email);
