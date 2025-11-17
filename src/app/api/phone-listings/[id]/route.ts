import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Extended user type to include role and id
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id: string;
  role: string;
}

// GET - Get a specific phone listing by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const listing = await prisma.phoneListing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error fetching phone listing:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch phone listing' },
      { status: 500 }
    );
  }
}

// PATCH - Update a phone listing (status, price, etc.)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = params.id;
    const body = await req.json();
    
    // Get the current listing
    const currentListing = await prisma.phoneListing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    
    if (!currentListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    // Check permissions (admin can update any listing, users can only update their own)
    const user = session.user as ExtendedUser;
    const isAdmin = user.role === 'admin';
        
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // If user is not admin, they can only update certain fields
    const updateData: {
      status?: string;
      price?: number;
      description?: string;
    } = {};
    
    if (isAdmin) {
      // Admins can update status and other fields
      if (body.status) updateData.status = body.status;
      if (body.price) updateData.price = parseFloat(body.price);
      if (body.description) updateData.description = body.description;
    } else {
      // Regular users can only update price and description
      if (body.price) updateData.price = parseFloat(body.price);
      if (body.description) updateData.description = body.description;
      
      // Users cannot change status directly
      if (body.status && body.status === 'pending' && currentListing.status === 'rejected') {
        // Allow resubmission if previously rejected
        updateData.status = 'pending';
      }
    }
    
    // Update the listing
    const updatedListing = await prisma.phoneListing.update({
      where: { id },
      data: updateData,
    });
    
    // Create notification for status changes
    if (body.status && body.status !== currentListing.status) {
      // Notify the user about status change
      // @ts-expect-error - New Prisma model not recognized by TypeScript
      await prisma.notification.create({
        data: {
          title: `Listing ${body.status}`,
          message: `Your listing for ${currentListing.brand} ${currentListing.model} has been ${body.status}.`,
          type: body.status === 'approved' ? 'success' : body.status === 'rejected' ? 'error' : 'info',
          userId: currentListing.userId,
        },
      });
      
      // If approved, also create a system notification
      if (body.status === 'approved') {
        // @ts-expect-error - New Prisma model not recognized by TypeScript
        await prisma.notification.create({
          data: {
            title: 'New Phone Available',
            message: `A ${currentListing.brand} ${currentListing.model} is now available for purchase.`,
            type: 'info',
          },
        });
      }
    }
    
    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Error updating phone listing:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update phone listing' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a phone listing
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = params.id;
    
    
    const listing = await prisma.phoneListing.findUnique({
      where: { id },
    });
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    // Check permissions (admin can delete any listing, users can only delete their own)
    const user = session.user as ExtendedUser;
    const isAdmin = user.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    
    await prisma.phoneListing.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting phone listing:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete phone listing' },
      { status: 500 }
    );
  }
} 