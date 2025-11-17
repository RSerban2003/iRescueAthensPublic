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

// GET - Get all phones for sale
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || (session.user as ExtendedUser).role !== 'admin') {
      // Check for admin key as alternative authentication
      const { searchParams } = new URL(request.url);
      const adminKey = searchParams.get('adminKey');
      
      if (adminKey != process.env.ADMIN_KEY) {
        return NextResponse.json(
          { error: 'Unauthorized: Admin access required' },
          { status: 403 }
        );
      }
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    console.log('Admin requested phones for sale with status:', status);
    
    // Set up filter object
    const filter: {
      status?: string;
    } = {};
    
    // Apply status filter if provided and not 'all'
    if (status && status.toLowerCase() !== 'all') {
      filter.status = status.toUpperCase();
    }
    
    console.log('Using filter:', filter);
    
    // Get phones with applied filters
    const phones = await prisma.phoneForSale.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${phones.length} phones for sale`);
    
    return NextResponse.json({ phones });
  } catch (error) {
    console.error('Error fetching phones for sale:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phones for sale' },
      { status: 500 }
    );
  }
} 