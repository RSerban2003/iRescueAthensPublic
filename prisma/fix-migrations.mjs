#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { readdir } from 'fs/promises';

async function fixMigrations() {
  console.log('🔄 Fixing migrations for PostgreSQL compatibility...');
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  
  try {
    // Get all migration directories
    const migrations = await readdir(migrationsDir, { withFileTypes: true });
    const migrationDirs = migrations
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`Found ${migrationDirs.length} migration directories`);
    
    // Process each migration directory
    for (const dir of migrationDirs) {
      const migrationPath = path.join(migrationsDir, dir);
      const sqlFile = path.join(migrationPath, 'migration.sql');
      
      if (fs.existsSync(sqlFile)) {
        console.log(`Processing ${sqlFile}`);
        let content = fs.readFileSync(sqlFile, 'utf8');
        
        // Replace SQLite specific syntax with PostgreSQL compatible syntax
        content = content
          // Replace DATETIME with TIMESTAMP
          .replace(/DATETIME/g, 'TIMESTAMP')
          
          // Fix primary key definitions to be at the end of column definitions
          .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
          
          // Use double quotes for identifiers in CREATE TABLE statements
          .replace(/CREATE TABLE "([^"]+)"/g, 'CREATE TABLE "$1"')
          
          // Fix default timestamps
          .replace(/DEFAULT CURRENT_TIMESTAMP/g, "DEFAULT CURRENT_TIMESTAMP");
        
        // Write updated content back to file
        fs.writeFileSync(sqlFile, content);
        console.log(`Updated ${sqlFile}`);
      }
    }
    
    console.log('✅ Successfully fixed migrations for PostgreSQL compatibility');
    return true;
  } catch (error) {
    console.error('❌ Error fixing migrations:', error);
    return false;
  }
}

fixMigrations().catch(error => {
  console.error('❌ Migration fix failed with error:', error);
  process.exit(1);
}); 