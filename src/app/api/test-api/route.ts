import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Attempt a simple query to get database schema information
    console.log('Testing database connection and schema...');
    
    // Get available days schema information
    const schema = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'AvailableDays'
      ORDER BY ordinal_position
    `;
    
    // Query all available days to check structure
    const days = await prisma.$queryRaw`
      SELECT * FROM "AvailableDays" LIMIT 5
    `;
    
    // Log database structure and actual values
    const dayKeys = days && Array.isArray(days) && days.length > 0 
      ? Object.keys(days[0]) 
      : [];
    
    console.log('AvailableDays schema:', schema);
    console.log('AvailableDays sample keys:', dayKeys);
    
    if (days && Array.isArray(days) && days.length > 0) {
      console.log('Sample day object:', days[0]);
    }
    
    return NextResponse.json({
      success: true,
      schema,
      dayKeys,
      hasSampleData: days && Array.isArray(days) && days.length > 0,
      totalDays: days && Array.isArray(days) ? days.length : 0
    });
  } catch (error) {
    console.error('Error testing database:', error);
    return NextResponse.json(
      { error: 'Database connection test failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 