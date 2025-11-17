import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Update an available day
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Extract admin key from query params
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');
    
    // Verify admin key
    if (adminKey != process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid admin key.' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Create update data object
    const updateData: any = {};
    
    // Only include fields that are provided in the request body
    if (body.date !== undefined) {
      const date = new Date(body.date);
      
      // Validate date
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format. Use ISO format (YYYY-MM-DD).' },
          { status: 400 }
        );
      }
      
      updateData.date = date;
    }
    
    if (body.fullDay !== undefined) {
      updateData.fullDay = body.fullDay;
    }
    
    if (body.note !== undefined) {
      updateData.note = body.note;
    }
    
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }
    
    // Update available day
    const updatedAvailableDay = await prisma.availableDays.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ 
      success: true, 
      availableDay: updatedAvailableDay 
    });
  } catch (error) {
    console.error('Error updating available day:', error);
    return NextResponse.json(
      { error: 'Failed to update available day', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Delete an available day
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Extract admin key from query params
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');
    
    // Verify admin key
    if (adminKey != process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid admin key.' },
        { status: 401 }
      );
    }
    
    // Delete available day
    await prisma.availableDays.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Available day deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting available day:', error);
    return NextResponse.json(
      { error: 'Failed to delete available day', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 