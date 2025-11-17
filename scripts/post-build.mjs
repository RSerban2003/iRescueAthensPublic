#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function postBuild() {
  console.log('Running post-build operations...');
  
  try {
    // Only run migrations if DATABASE_URL is defined
    if (process.env.DATABASE_URL) {
      console.log('Applying database migrations...');
      await execAsync('npx prisma migrate deploy');
      console.log('Database migrations applied successfully!');
    } else {
      console.warn('DATABASE_URL not found. Skipping database migrations.');
    }
    
    console.log('Post-build operations completed successfully.');
    return true;
  } catch (error) {
    console.error('Error during post-build operations:', error);
    // Don't fail the build
    return false;
  }
}

postBuild().catch(error => {
  console.error('Post-build script failed with error:', error);
  // Don't fail the build
}); 