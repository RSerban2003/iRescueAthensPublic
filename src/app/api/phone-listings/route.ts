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

// Interface for phone listing data
interface PhoneListingData {
  brand: string;
  model: string;
  price: number;
  condition: string;
  storage: string;
  description: string;
  images: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

// POST - Create a new phone listing
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    console.log('Creating phone listing with data:', data);
    
    // Validate required fields
    if (!data.brand || !data.model || !data.price || !data.condition || !data.storage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check authentication if present
    const session = await getServerSession(authOptions);
    
    // Process images field - ensure it's stored as a JSON string
    let processedImages = '';
    if (data.images) {
      // If images is already a string, check if it's JSON formatted
      if (typeof data.images === 'string') {
        try {
          // Try parsing to see if it's valid JSON
          JSON.parse(data.images);
          processedImages = data.images;
        } catch {
          // If not valid JSON, treat as a single image URL
          processedImages = JSON.stringify([data.images]);
        }
      } else if (Array.isArray(data.images)) {
        // If it's an array, stringify it
        processedImages = JSON.stringify(data.images);
      } else {
        // Default case - empty array
        processedImages = '[]';
      }
    } else {
      // No images provided
      processedImages = '[]';
    }
    
    // If authenticated, set userId, otherwise use the provided contact info
    const listingData: PhoneListingData = {
      brand: data.brand,
      model: data.model,
      price: parseFloat(data.price),
      condition: data.condition,
      storage: data.storage,
      description: data.description || '',
      images: processedImages, // Use processed images string
      status: session?.user ? 'PENDING' : 'PENDING', // Default to pending, can be overridden
      name: data.name || 'Anonymous',
      email: data.email || 'no-email@example.com',
      phone: data.phone || '',
      address: data.address || ''
    };
    
    // Override status if admin
    if (session?.user && (session.user as ExtendedUser).role === 'admin') {
      listingData.status = data.status || 'APPROVED';
    }

    // If status is specifically provided and user is admin or using adminKey
    if (data.status && ((session?.user && (session.user as ExtendedUser).role === 'admin') || data.adminKey == process.env.ADMIN_KEY)) {
      listingData.status = data.status;
    }
    
    console.log('Final listing data before save:', {
      ...listingData,
      images: listingData.images.substring(0, 50) + (listingData.images.length > 50 ? '...' : '') // Truncate images for log
    });
    
    // Create the listing
    const listing = await prisma.phoneListing.create({
      data: listingData
    });
    
    return NextResponse.json({ listing, success: true });
  } catch (error) {
    console.error('Error creating phone listing:', error);
    return NextResponse.json(
      { error: 'Failed to create phone listing', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    console.log('Public phone listings requested with status:', status);
    
    // Set up filter object
    const filter: { status?: string } = {};
    
    // Apply status filter if provided
    if (status && status.toLowerCase() !== 'all') {
      filter.status = status.toUpperCase();
    } else if (status && status.toLowerCase() === 'all') {
      // Don't add any status filter if 'all' is requested - show everything
    } else {
      // Default to only approved listings if no status provided
      filter.status = 'APPROVED';
    }
    
    console.log('Using filter:', filter);
    
    // Get listings with applied filters
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