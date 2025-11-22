const { db } = require('../config/firebase');

/**
 * Script to seed initial services data
 * Usage: node scripts/seedServices.js
 */

const services = [
  {
    name: 'Standard Smoke Emission Test',
    description: 'Standard smoke emission testing for all vehicle types including cars, SUVs, and light trucks. Includes CO2 level measurement and smoke opacity testing.',
    price: 500,
    duration: '30 minutes',
    category: 'standard'
  },
  {
    name: 'Motorcycle Smoke Test',
    description: 'Specialized smoke emission testing for motorcycles and scooters. Quick and affordable testing service.',
    price: 300,
    duration: '20 minutes',
    category: 'motorcycle'
  },
  {
    name: 'Heavy Vehicle Smoke Test',
    description: 'Comprehensive smoke emission testing for heavy vehicles including buses, trucks, and commercial vehicles.',
    price: 800,
    duration: '45 minutes',
    category: 'heavy'
  },
  {
    name: 'Express Testing Service',
    description: 'Priority smoke emission testing with faster turnaround time. Same-day results guaranteed.',
    price: 700,
    duration: '20 minutes',
    category: 'express'
  }
];

async function seedServices() {
  try {
    console.log('Starting to seed services...\n');
    
    for (const service of services) {
      const docRef = await db.collection('services').add(service);
      console.log(`✓ Added: ${service.name} (${docRef.id})`);
    }
    
    console.log('\n✓ All services seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding services:', error.message);
    process.exit(1);
  }
}

seedServices();
