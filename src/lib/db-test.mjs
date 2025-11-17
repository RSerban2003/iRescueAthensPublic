import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Try a simple query to check the connection
    const result = await prisma.$queryRaw`SELECT 1 as alive`;
    
    if (result && result[0]?.alive === 1) {
      console.log('✅ Database connection successful!');
      console.log('Database connection details:');
      
      // Get database version
      const versionResult = await prisma.$queryRaw`SELECT version()`;
      console.log(`PostgreSQL version: ${versionResult[0].version}`);
      
      // List tables in the database
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      console.log('Tables in database:');
      tables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
      
      return true;
    } else {
      console.error('❌ Database connection test failed: Unexpected response');
      return false;
    }
  } catch (error) {
    console.error('❌ Database connection test failed:');
    console.error(error);
    
    // Provide more specific error messages based on error types
    if (error.code === 'P1001') {
      console.error('Could not reach database server. Please check your connection string and network connectivity.');
    } else if (error.code === 'P1003') {
      console.error('Database does not exist. Please make sure the database specified in DATABASE_URL exists.');
    } else if (error.code === 'P1017') {
      console.error('Server rejected the connection. Please check your credentials (username/password).');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Unhandled error during connection test:', error);
    process.exit(1);
  }); 