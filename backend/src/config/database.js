const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Create a simple mock client for fallback
const mockClient = {
  user: {
    findUnique: (args) => {
      console.log('MOCK: findUnique', args);
      return Promise.resolve(null);
    },
    create: (args) => {
      console.log('MOCK: create', args);
      return Promise.resolve({
        id: 'mock-id-' + Date.now(),
        ...args.data
      });
    },
    update: (args) => {
      console.log('MOCK: update', args);
      return Promise.resolve(null);
    },
  }
};

// Try to import from the generated directory
let prisma;
try {
  // Use the path specified in the Prisma schema
  const { PrismaClient } = require('../generated/prisma');
  prisma = new PrismaClient();
  console.log('Prisma client initialized successfully from generated directory');
} catch (error) {
  console.error('Failed to import from generated directory:', error.message);
  prisma = mockClient;
}

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'URL is set' : 'URL is NOT set');

module.exports = prisma;
