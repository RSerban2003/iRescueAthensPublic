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

// Types for request data
interface PhoneForSaleData {
  brand: string;
  model: string;
  price: number;
  condition: string;
  storage: string;
  color: string;
  description?: string;
  images: string;
  year?: number;
  status?: string;
}

// GET - Get phones for sale
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const brand = searchParams.get('brand');
    
    console.log('Requested phones for sale with status:', status, 'and brand:', brand);
    
    // Set up filter object
    const filter: {
      status?: string;
      brand?: string;
    } = {};
    
    // Apply status filter if provided
    if (status && status.toLowerCase() !== 'all') {
      filter.status = status.toUpperCase();
    } else if (!status || status.toLowerCase() === 'all') {
      // Default behavior for purchase page - only show available phones
      filter.status = 'AVAILABLE';
    }
    
    // Apply brand filter if provided
    if (brand && brand.toLowerCase() !== 'all') {
      filter.brand = brand;
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

// POST - Create a new phone for sale
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users to create phones for sale
    if (!session?.user || (session.user as ExtendedUser).role !== 'admin') {
      // Check for admin key as alternative authentication
      const { searchParams } = new URL(request.url);
      const adminKey = searchParams.get('adminKey');
      
      if (adminKey !== process.env.ADMIN_KEY) {
        return NextResponse.json(
          { error: 'Unauthorized: Admin access required' },
          { status: 403 }
        );
      }
    }
    
    const data = await request.json() as PhoneForSaleData;
    console.log('Creating phone for sale with data:', data);
    
    // Validate required fields
    if (!data.brand || !data.model || !data.price || !data.condition || !data.storage || !data.color) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Set current year as default if not provided
    if (!data.year) {
      data.year = new Date().getFullYear();
    }
    
    // Create the phone listing
    const phone = await prisma.phoneForSale.create({
      data: {
        brand: data.brand,
        model: data.model,
        price: data.price,
        condition: data.condition,
        storage: data.storage,
        color: data.color,
        description: data.description || '',
        images: data.images,
        year: data.year,
        status: data.status || 'AVAILABLE'
      }
    });
    
    return NextResponse.json({ phone, success: true });
  } catch (error) {
    console.error('Error creating phone for sale:', error);
    return NextResponse.json(
      { error: 'Failed to create phone for sale' },
      { status: 500 }
    );
  }
} 