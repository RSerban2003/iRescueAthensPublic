import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Default hours in case no configuration exists
const DEFAULT_HOURS = '09:00,10:00,11:00,12:00,13:00,14:00,15:00,16:00,17:00';

// Get available hours for the booking form
export async function GET() {
  try {
    let availableHours = null;
    
    try {
      // Try to get the active available hours configuration through Prisma
      availableHours = await prisma.availableHours.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
      });
    } catch (err) {
      console.warn('Error accessing AvailableHours through Prisma:', err);
      
      // Fallback to raw query if Prisma model is not accessible
      const rawResult = await prisma.$queryRaw`
        SELECT * FROM "AvailableHours" 
        WHERE "isActive" = true 
        ORDER BY "updatedAt" DESC 
        LIMIT 1
      `;
      
      if (Array.isArray(rawResult) && rawResult.length > 0) {
        availableHours = rawResult[0];
      }
    }
    
    // If no configuration exists, return default hours
    if (!availableHours) {
      return NextResponse.json({ hours: DEFAULT_HOURS.split(',') });
    }
    
    // Convert the hours string to an array for frontend use
    const hoursArray = availableHours.hours.split(',');
    
    return NextResponse.json({ hours: hoursArray });
  } catch (error) {
    console.error('Error fetching available hours:', error);
    // Return default hours in case of error
    return NextResponse.json({ hours: DEFAULT_HOURS.split(',') });
  }
} 