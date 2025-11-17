import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get available days configuration for admin
export async function GET(request: Request) {
  try {
    // Check for admin authorization
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');
    
    if (adminKey != process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all available days from database using raw query
    const availableDays = await prisma.$queryRaw`
      SELECT * FROM "AvailableDays" ORDER BY date ASC
    `;
    
    // Map the database columns (lowercase) to the frontend expected format (camelCase)
    const mappedDays = Array.isArray(availableDays) 
      ? availableDays.map(day => {
          // Get the date without time component
          const dateStr = new Date(day.date).toISOString().split('T')[0];
          
          // Create a new date object with the local timezone
          const localDate = new Date(dateStr + 'T00:00:00');
          
          return {
            id: day.id,
            date: localDate.toISOString(),
            fullday: day.fullday,
            note: day.note,
            isactive: day.isactive
          };
        })
      : [];
    
    return NextResponse.json({ success: true, availableDays: mappedDays });
  } catch (error) {
    console.error('Error fetching available days:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available days', days: [] },
      { status: 500 }
    );
  }
}

// Add a new available day or update an existing one
export async function POST(request: Request) {
  try {
    // Check for admin authorization
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');
    
    if (adminKey != process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get day from request body
    const requestBody = await request.json();
    const { date, note } = requestBody;
    
    // Handle both fullDay and fullday
    const fullDay = requestBody.fullDay !== undefined ? requestBody.fullDay : requestBody.fullday;
    
    // Handle both isActive and isactive formats
    const isActive = requestBody.isActive !== undefined ? requestBody.isActive : requestBody.isactive;
    
    console.log('Received day data:', { date, fullDay, note, isActive, originalBody: requestBody });
    
    // Validate date
    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }
    
    // Format the date to ensure consistent storage
    let formattedDate;
    if (typeof date === 'string') {
      // If date is a string, parse it correctly
      if (date.includes('T')) {
        // If it's an ISO string, convert to date
        formattedDate = new Date(date);
      } else {
        // If it's a date-only string, add the time component
        formattedDate = new Date(date + 'T00:00:00');
      }
    } else if (date instanceof Date) {
      // If it's already a Date object
      formattedDate = date;
    } else {
      // For any other format, try to convert as is
      formattedDate = new Date(date);
    }
    
    // Get just the date portion to avoid timezone issues
    const dateStr = formattedDate.toISOString().split('T')[0];
    formattedDate = new Date(dateStr + 'T00:00:00');
    
    // Log for debugging
    console.log(`Processing date: ${date}, formatted as: ${formattedDate.toISOString()}`);
    
    // Check if this date already exists using raw query
    const existingDay = await prisma.$queryRaw`
      SELECT * FROM "AvailableDays" 
      WHERE date::date = ${formattedDate}::date
      LIMIT 1
    `;
    
    let result;
    
    if (Array.isArray(existingDay) && existingDay.length > 0) {
      // Update existing day
      console.log(`Updating existing day: ${existingDay[0].id}`);
      await prisma.$executeRaw`
        UPDATE "AvailableDays"
        SET 
          "fullday" = ${fullDay !== undefined ? fullDay : existingDay[0].fullday},
          "note" = ${note !== undefined ? note : existingDay[0].note},
          "isactive" = ${isActive !== undefined ? isActive : existingDay[0].isactive},
          "updatedat" = CURRENT_TIMESTAMP
        WHERE id = ${existingDay[0].id}
      `;
      
      // Get updated record
      const updatedRecord = await prisma.$queryRaw`
        SELECT * FROM "AvailableDays" WHERE id = ${existingDay[0].id}
      `;
      
      if (Array.isArray(updatedRecord) && updatedRecord.length > 0) {
        // Map database columns to frontend expected format
        result = {
          id: updatedRecord[0].id,
          date: new Date(updatedRecord[0].date).toISOString(),
          fullday: updatedRecord[0].fullday,
          note: updatedRecord[0].note,
          isactive: updatedRecord[0].isactive
        };
      }
    } else {
      // Create new day
      console.log(`Creating new day for date: ${formattedDate.toISOString()}`);
      const insertResult = await prisma.$queryRaw`
        INSERT INTO "AvailableDays" 
        ("id", "date", "fullday", "note", "isactive", "createdat", "updatedat")
        VALUES 
        (uuid_generate_v4(), ${formattedDate}, ${fullDay !== undefined ? fullDay : true}, ${note || null}, ${isActive !== undefined ? isActive : true}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      
      if (Array.isArray(insertResult) && insertResult.length > 0) {
        // Map database columns to frontend expected format
        result = {
          id: insertResult[0].id,
          date: new Date(insertResult[0].date).toISOString(),
          fullday: insertResult[0].fullday,
          note: insertResult[0].note,
          isactive: insertResult[0].isactive
        };
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      day: result
    });
  } catch (error) {
    console.error('Error adding/updating available day:', error);
    return NextResponse.json(
      { error: 'Failed to add/update available day' },
      { status: 500 }
    );
  }
}

// Delete an available day
export async function DELETE(request: Request) {
  try {
    // Check for admin authorization
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');
    const dayId = searchParams.get('id');
    
    if (adminKey != process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!dayId) {
      return NextResponse.json(
        { error: 'Day ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the day
    await prisma.$executeRaw`
      DELETE FROM "AvailableDays" WHERE id = ${dayId}
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Day deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting available day:', error);
    return NextResponse.json(
      { error: 'Failed to delete available day' },
      { status: 500 }
    );
  }
}

// Get available days for the public API (no admin check)
export async function OPTIONS() {
  try {
    // Get only future dates that are active
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const availableDays = await prisma.$queryRaw`
      SELECT * FROM "AvailableDays"
      WHERE "isactive" = true
      AND date >= ${today}
      ORDER BY date ASC
    `;
    
    // Map the database columns (lowercase) to the frontend expected format (camelCase)
    const mappedDays = Array.isArray(availableDays) 
      ? availableDays.map(day => ({
          id: day.id,
          date: day.date,
          fullDay: day.fullday,
          note: day.note,
          isActive: day.isactive
        }))
      : [];
    
    return NextResponse.json({ days: mappedDays });
  } catch (error) {
    console.error('Error fetching public available days:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available days', days: [] },
      { status: 500 }
    );
  }
} 