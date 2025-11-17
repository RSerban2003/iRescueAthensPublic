import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get available days for public use (no admin check required)
export async function GET() {
  try {
    // Get only future dates that are active
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Fetching available days, today is:', today.toISOString());
    
    const availableDays = await prisma.$queryRaw`
      SELECT * FROM "AvailableDays" 
      WHERE "isactive" = true 
      AND date >= ${today} 
      ORDER BY date ASC
    `;
    
    console.log('Raw available days from DB:', availableDays);
    
    // Map the database columns (lowercase) to the frontend expected format (camelCase)
    const mappedDays = Array.isArray(availableDays) 
      ? availableDays.map(day => {
          // Get the date without time component
          const dateStr = new Date(day.date).toISOString().split('T')[0];
          
          // Create a new date object with the local timezone
          const localDate = new Date(dateStr + 'T00:00:00');
          
          console.log(`Date from DB: ${day.date}, Local date: ${localDate.toISOString()}`);
          
          return {
            id: day.id,
            date: localDate.toISOString(), // Use local date
            fullDay: day.fullday,
            note: day.note,
            isActive: day.isactive
          };
        })
      : [];
    
    console.log('Mapped days with fixed dates:', mappedDays);
    
    return NextResponse.json({ days: mappedDays });
  } catch (error) {
    console.error('Error fetching available days:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available days', days: [] },
      { status: 500 }
    );
  }
} 