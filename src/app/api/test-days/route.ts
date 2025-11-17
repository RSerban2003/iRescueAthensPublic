import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Attempting to create a test day...');
    
    // Set date to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create one test day
    try {
      // Check if today already exists
      const existingDay = await prisma.$queryRaw`
        SELECT * FROM "AvailableDays" 
        WHERE date::date = ${today}::date
        LIMIT 1
      `;
      
      if (Array.isArray(existingDay) && existingDay.length > 0) {
        // Update existing day
        await prisma.$executeRaw`
          UPDATE "AvailableDays"
          SET 
            "fullday" = ${true},
            "note" = ${'Available for booking'},
            "isactive" = ${true},
            "updatedat" = CURRENT_TIMESTAMP
          WHERE id = ${existingDay[0].id}
        `;
        
        console.log(`Updated existing day for today`);
        
        return NextResponse.json({ 
          success: true, 
          message: `Updated today as an available day`,
          day: {
            date: today,
            isActive: true,
            note: 'Available for booking'
          }
        });
      } else {
        // Create new day for today
        await prisma.$executeRaw`
          INSERT INTO "AvailableDays" 
          ("id", "date", "fullday", "note", "isactive", "createdat", "updatedat")
          VALUES 
          (uuid_generate_v4(), ${today}, ${true}, ${'Available for booking'}, ${true}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        console.log(`Created a new day for today`);
        
        return NextResponse.json({ 
          success: true, 
          message: `Created today as an available day`,
          day: {
            date: today,
            isActive: true,
            note: 'Available for booking'
          }
        });
      }
    } catch (err) {
      console.error(`Error setting up available day:`, err);
      throw err; // Propagate the error to be caught by the outer try-catch
    }
  } catch (error) {
    console.error('Error setting up available day:', error);
    return NextResponse.json(
      { error: 'Failed to set up available day', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 