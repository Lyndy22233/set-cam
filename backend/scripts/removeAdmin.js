const { admin } = require('../config/firebase');

/**
 * Script to remove admin privileges from a user
 * Usage: node scripts/removeAdmin.js user@example.com
 */

async function removeAdminClaim(email) {
  try {
    console.log(`Removing admin claim from: ${email}`);
    
    const user = await admin.auth().getUserByEmail(email);
    
    await admin.auth().setCustomUserClaims(user.uid, { 
      admin: false 
    });
    
    console.log('✓ Admin claim successfully removed!');
    console.log(`User: ${user.email} (${user.uid})`);
    console.log('\nNote: User must log out and log back in for changes to take effect.');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error removing admin claim:', error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.log('Usage: node scripts/removeAdmin.js user@example.com');
  process.exit(1);
}

removeAdminClaim(email);
