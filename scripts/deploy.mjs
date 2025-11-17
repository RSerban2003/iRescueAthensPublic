#!/usr/bin/env node
/**
 * Vercel deployment helper script
 * This script verifies that all required environment variables are set before deployment.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Required environment variables for production
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET'
];

// Function to check environment variables through Vercel CLI
function checkVercelEnvVars() {
  console.log('🔍 Checking Vercel environment variables...');
  
  try {
    // Ensure user is logged in to Vercel CLI
    try {
      execSync('vercel whoami', { stdio: 'pipe' });
    } catch {
      console.error('❌ You are not logged in to Vercel CLI. Please run "vercel login" first.');
      process.exit(1);
    }

    // Pull environment variables to check if they're configured
    console.log('🔄 Pulling environment variables from Vercel...');
    execSync('vercel env pull .env.vercel', { stdio: 'pipe' });
    
    // Read the pulled environment file
    const envContent = fs.readFileSync(path.join(rootDir, '.env.vercel'), 'utf-8');
    
    // Check required environment variables
    const missing = [];
    for (const envVar of requiredEnvVars) {
      if (!envContent.includes(`${envVar}=`) || envContent.includes(`${envVar}="`)) {
        missing.push(envVar);
      }
    }
    
    // Clean up temporary file
    fs.unlinkSync(path.join(rootDir, '.env.vercel'));
    
    if (missing.length > 0) {
      console.error(`❌ Missing required environment variables in Vercel: ${missing.join(', ')}`);
      console.log('Please set these variables using "vercel env add"');
      return false;
    }
    
    console.log('✅ All required environment variables are set in Vercel.');
    return true;
  } catch (error) {
    console.error('❌ Error checking Vercel environment variables:', error.message);
    return false;
  }
}

// Main deployment function
async function deploy() {
  console.log('🚀 Preparing for Vercel deployment...');
  
  // Check if we're in a Vercel CI environment - if so, skip checks
  if (process.env.VERCEL || process.env.CI) {
    console.log('🔄 Running in CI environment - skipping pre-deployment checks.');
    process.exit(0);
  }
  
  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'pipe' });
  } catch {
    console.error('❌ Vercel CLI is not installed. Please install it with "npm i -g vercel".');
    process.exit(1);
  }
  
  // Check Vercel environment variables
  const envVarsSet = checkVercelEnvVars();
  if (!envVarsSet) {
    console.error('❌ Please set the required environment variables before deploying.');
    process.exit(1);
  }
  
  console.log('🔄 Running build to verify everything works...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch {
    console.error('❌ Build failed. Please fix the issues before deploying.');
    process.exit(1);
  }
  
  console.log('✅ Pre-deployment checks passed. Deploying to Vercel...');
  execSync('vercel --prod', { stdio: 'inherit' });
}

deploy().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
}); 