#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
const schemaPath = path.join(process.cwd(), 'prisma', 'postgres-schema.sql');

async function runCommand(command) {
  try {
    const { stdout, stderr } = await execAsync(command);
    console.log(`${stdout}`);
    if (stderr) console.error(`Error: ${stderr}`);
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return false;
  }
}

async function createTablesWithRawSQL() {
  console.log('🔄 Attempting to create tables directly using SQL...');
  try {
    // The DATABASE_URL environment variable should be in format:
    // postgresql://username:password@hostname:port/database
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      console.error('❌ DATABASE_URL environment variable not set');
      return false;
    }
    
    // Read SQL file content
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Create a temporary file with the SQL
    const tempPath = path.join(process.cwd(), 'prisma', 'temp-schema.sql');
    fs.writeFileSync(tempPath, sqlContent);
    
    // Execute SQL directly using psql
    console.log('🔄 Running SQL schema creation...');
    
    // Extract connection details from DATABASE_URL
    const url = new URL(dbUrl);
    const host = url.hostname;
    const port = url.port || 5432;
    const database = url.pathname.substring(1); // Remove leading '/'
    const username = url.username;
    const password = url.password;
    
    // Construct psql command
    const psqlCommand = `PGPASSWORD=${password} psql -h ${host} -p ${port} -U ${username} -d ${database} -f ${tempPath}`;
    
    try {
      await execAsync(psqlCommand);
      console.log('✅ Database tables created successfully via SQL!');
      return true;
    } catch (error) {
      console.error('❌ Failed to execute SQL directly:', error.message);
      return false;
    } finally {
      // Clean up temporary file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  } catch (error) {
    console.error('❌ Failed to create tables with raw SQL:', error);
    return false;
  }
}

async function setupDatabase() {
  console.log('🔄 Setting up database...');

  // Check database connection
  console.log('🔄 Checking database connection...');
  try {
    await runCommand('npx prisma db pull --force');
    console.log('✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error(error);
    process.exit(1);
  }

  // Deploy migrations
  console.log('🔄 Deploying migrations...');
  const migrateSuccess = await runCommand('npx prisma migrate deploy');
  
  if (!migrateSuccess) {
    console.log('⚠️ Migration failed, attempting to create tables with Prisma db push...');
    const pushSuccess = await runCommand('npx prisma db push --accept-data-loss');
    
    if (!pushSuccess) {
      console.log('⚠️ Prisma db push failed, attempting to create tables with raw SQL...');
      const sqlSuccess = await createTablesWithRawSQL();
      
      if (!sqlSuccess) {
        console.error('❌ Database setup failed! Could not create tables.');
        process.exit(1);
      }
    }
  }

  // Generate Prisma client
  console.log('🔄 Generating Prisma Client...');
  const generateSuccess = await runCommand('npx prisma generate');
  
  if (!generateSuccess) {
    console.error('❌ Failed to generate Prisma Client!');
    process.exit(1);
  }

  console.log('✅ Database setup complete!');
}

setupDatabase().catch(error => {
  console.error('❌ Database setup failed with error:', error);
  process.exit(1);
}); 