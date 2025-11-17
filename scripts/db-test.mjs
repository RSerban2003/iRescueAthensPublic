import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').replace(/^"(.*)"$/, '$1');
        
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    }
    
    console.log('Loaded environment variables from .env file');
  } catch (error) {
    console.error('Error loading .env file:', error.message);
  }
}

// Load environment variables
loadEnv();

console.log('Database URL:', process.env.DATABASE_URL);

// Initialize Prisma Client
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Connection successful!', result);
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
testConnection(); 