#!/usr/bin/env node
import { execSync } from 'child_process';

/**
 * This script helps run database migrations after Vercel deployment
 * Usage: 
 * 1. Run `vercel env pull` to get your environment variables
 * 2. Run `node scripts/deploy-migrations.mjs`
 */

function deployMigrations() {
  console.log('📦 Running database migrations...');
  
  try {
    // Check if we have DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable not found!');
      console.log('💡 Tip: Run "vercel env pull" to get your environment variables');
      process.exit(1);
    }
    
    // Generate Prisma client with the current schema
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Deploy migrations
    console.log('🚀 Deploying database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Error during database migrations:', error.message);
    process.exit(1);
  }
}

deployMigrations(); 