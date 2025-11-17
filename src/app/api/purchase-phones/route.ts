import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get approved phone listings for the purchase page
export async function GET() {
  try {
    // Only fetch APPROVED listings for the purchase page
    const listings = await prisma.phoneListing.findMany({
      where: { 
        status: 'APPROVED',
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Transform the listings to match the PhoneProduct interface
    const phoneProducts = listings.map(listing => {
      // Parse images to get the first image for the product display
      let image = '/default-phone.jpg'; // Default image
      try {
        const images = JSON.parse(listing.images);
        if (Array.isArray(images) && images.length > 0) {
          image = images[0];
        } else if (typeof images === 'string' && images) {
          image = images;
        } else if (typeof listing.images === 'string' && listing.images) {
          image = listing.images;
        }
      } catch {
        // If parsing fails, use the images string directly if it's not empty
        if (listing.images) {
          image = listing.images;
        }
      }
      
      // Default to current year if no year is specified
      const currentYear = new Date().getFullYear();
      
      return {
        id: listing.id,
        brand: listing.brand,
        model: listing.model,
        price: Number(listing.price),
        condition: listing.condition,
        storage: listing.storage,
        color: listing.description?.includes('color') ? listing.description.split('color:')[1]?.trim().split(' ')[0] || 'Unknown' : 'Unknown',
        image: image,
        year: currentYear,
        description: listing.description || '',
        status: listing.status
      };
    });
    
    return NextResponse.json({ phones: phoneProducts });
  } catch (error) {
    console.error('Error fetching purchase phones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phones' },
      { status: 500 }
    );
  }
} 