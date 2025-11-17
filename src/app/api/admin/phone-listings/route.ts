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

export async function GET(request: Request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as ExtendedUser).role !== 'admin') {
      console.log('Admin authentication failed:', session?.user);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    console.log('Admin phone listings requested with status:', status);
    
    // Set up filter object
    const filter: { status?: string } = {};
    
    // Apply status filter if provided and not 'all'
    if (status && status.toLowerCase() !== 'all') {
      filter.status = status.toUpperCase();
    }
    // Otherwise don't filter by status at all, to show everything
    
    console.log('Using filter:', filter);
    
    const listings = await prisma.phoneListing.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${listings.length} listings`);
    
    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Error fetching phone listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phone listings' },
      { status: 500 }
    );
  }
} 