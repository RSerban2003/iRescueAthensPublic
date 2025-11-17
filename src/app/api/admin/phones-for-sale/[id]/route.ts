import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Extended user type that includes role
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id: string;
  role: string;
}

// Check admin authorization
async function isAuthorized(request: Request) {
  // Check for session
  const session = await getServerSession(authOptions);
  
  if (session?.user && (session.user as ExtendedUser).role === 'admin') {
    return true;
  }
  
  // Check for admin key as fallback
  const { searchParams } = new URL(request.url);
  const adminKey = searchParams.get('adminKey');
  
  return adminKey == process.env.ADMIN_KEY;
}

// GET - Get a specific phone by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authorization
    if (!(await isAuthorized(request))) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    const id = params.id;
    
    const phone = await prisma.phoneForSale.findUnique({
      where: { id }
    });
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ phone });
  } catch (error) {
    console.error('Error fetching phone:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phone' },
      { status: 500 }
    );
  }
}

// PATCH - Update a specific phone
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authorization
    if (!(await isAuthorized(request))) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    const id = params.id;
    const data = await request.json();
    
    console.log(`Updating phone ${id} with data:`, data);
    
    // Check if phone exists
    const existingPhone = await prisma.phoneForSale.findUnique({
      where: { id }
    });
    
    if (!existingPhone) {
      return NextResponse.json(
        { error: 'Phone not found' },
        { status: 404 }
      );
    }
    
    // Update phone
    const updatedPhone = await prisma.phoneForSale.update({
      where: { id },
      data
    });
    
    return NextResponse.json({ phone: updatedPhone, success: true });
  } catch (error) {
    console.error('Error updating phone:', error);
    return NextResponse.json(
      { error: 'Failed to update phone' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific phone
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authorization
    if (!(await isAuthorized(request))) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    const id = params.id;
    
    // Check if phone exists
    const existingPhone = await prisma.phoneForSale.findUnique({
      where: { id }
    });
    
    if (!existingPhone) {
      return NextResponse.json(
        { error: 'Phone not found' },
        { status: 404 }
      );
    }
    
    // Delete phone
    await prisma.phoneForSale.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true, message: 'Phone deleted successfully' });
  } catch (error) {
    console.error('Error deleting phone:', error);
    return NextResponse.json(
      { error: 'Failed to delete phone' },
      { status: 500 }
    );
  }
} 