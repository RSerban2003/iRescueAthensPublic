import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Extended user type that includes role and id
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id: string;
  role: string;
}

// GET - Get a specific phone listing by ID (admin only)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || (session.user as ExtendedUser).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    const listing = await prisma.phoneListing.findUnique({
      where: { id }
    });
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error fetching phone listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phone listing' },
      { status: 500 }
    );
  }
}

// PATCH - Update a phone listing status (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || (session.user as ExtendedUser).role !== 'admin') {
      // Also allow access via adminKey for our hardcoded admin
      const { searchParams } = new URL(request.url);
      const adminKey = searchParams.get('adminKey');
      if (adminKey != process.env.ADMIN_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    const { id } = params;
    const { status } = await request.json();

    // Validate status
    if (!['pending', 'approved', 'sold', 'rejected', 'not_available'].includes(status.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Get the current listing to check if status is being changed
    const currentListing = await prisma.phoneListing.findUnique({
      where: { id }
    });

    if (!currentListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Update phone listing with normalized status
    const updatedListing = await prisma.phoneListing.update({
      where: { id },
      data: { status: status.toUpperCase() }
    });

    // Note: Notification functionality is removed as it seems to be causing errors
    // and may not be part of the current schema

    return NextResponse.json({ listing: updatedListing });
  } catch (error) {
    console.error('Error updating phone listing:', error);
    return NextResponse.json(
      { error: 'Failed to update phone listing' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a phone listing (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || (session.user as ExtendedUser).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    const listing = await prisma.phoneListing.findUnique({
      where: { id }
    });
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    // Delete the listing
    await prisma.phoneListing.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting phone listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete phone listing' },
      { status: 500 }
    );
  }
} 