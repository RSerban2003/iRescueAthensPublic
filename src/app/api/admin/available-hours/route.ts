import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Default hours in case no configuration exists
const DEFAULT_HOURS = '09:00,10:00,11:00,12:00,13:00,14:00,15:00,16:00,17:00';

// Get available hours configuration
export async function GET(request: Request) {
  try {
    // Check for admin authorization
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');
    
    if (adminKey != process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let availableHours = null;
    
    try {
      // Try to get the active available hours configuration
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
      return NextResponse.json({
        hours: DEFAULT_HOURS.split(',')
      });
    }
    
    // Convert the hours string to an array for frontend use
    const hoursArray = availableHours.hours.split(',');
    
    return NextResponse.json({ hours: hoursArray });
  } catch (error) {
    console.error('Error fetching available hours:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available hours', hours: DEFAULT_HOURS.split(',') },
      { status: 500 }
    );
  }
}

// Update available hours configuration
export async function POST(request: Request) {
  try {
    // Check for admin authorization
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');
    
    if (adminKey != process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get hours from request body
    const { hours } = await request.json();
    
    // Validate hours format
    if (!Array.isArray(hours) || hours.length === 0) {
      return NextResponse.json(
        { error: 'Hours must be a non-empty array of time strings' },
        { status: 400 }
      );
    }
    
    // Convert the array to a comma-separated string
    const hoursString = hours.join(',');
    
    let newHours = null;
    
    try {
      // Try Prisma model operations
      // Update all existing configurations to inactive
      await prisma.availableHours.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
      
      // Create new active configuration
      newHours = await prisma.availableHours.create({
        data: {
          hours: hoursString,
          isActive: true
        }
      });
    } catch (err) {
      console.warn('Error accessing AvailableHours through Prisma:', err);
      
      // Fallback to raw query if Prisma model is not accessible
      await prisma.$executeRaw`
        UPDATE "AvailableHours" 
        SET "isActive" = false 
        WHERE "isActive" = true
      `;
      
      // Insert new configuration using raw query
      const result = await prisma.$queryRaw`
        INSERT INTO "AvailableHours" 
        ("id", "hours", "isActive", "createdAt", "updatedAt") 
        VALUES 
        (uuid_generate_v4(), ${hoursString}, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      
      if (Array.isArray(result) && result.length > 0) {
        newHours = result[0];
      } else {
        throw new Error('Failed to create new hours configuration');
      }
    }
    
    if (!newHours) {
      throw new Error('Failed to save available hours');
    }
    
    return NextResponse.json({ 
      success: true, 
      hours: typeof newHours.hours === 'string' ? newHours.hours.split(',') : newHours.hours
    });
  } catch (error) {
    console.error('Error updating available hours:', error);
    return NextResponse.json(
      { error: 'Failed to update available hours' },
      { status: 500 }
    );
  }
} 