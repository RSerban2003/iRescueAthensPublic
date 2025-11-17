import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    console.log('Purchase booking data received:', data);
    
    // Extract data
    const { bookingData, itemDetails } = data;
    
    if (!bookingData || !itemDetails || itemDetails.length === 0) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }
    
    // Calculate total from item details
    const totalAmount = itemDetails.reduce((sum: number, item: { price: number }) => sum + item.price, 0);
    
    // Extract item details to get the first item (the phone)
    const firstItem = itemDetails[0];
    const titleParts = firstItem.title.split(' - ');
    const mainTitle = titleParts[0]; // This should be "{brand} {model}"
    
    // Extract brand and model more carefully
    let brand = 'Unknown';
    let model = 'Unknown';
    
    if (mainTitle && mainTitle.trim() !== '') {
      const parts = mainTitle.split(' ');
      if (parts.length > 0) {
        brand = parts[0];
        if (parts.length > 1) {
          model = parts.slice(1).join(' ');
        }
      }
    }
    
    console.log('Extracted brand:', brand, 'model:', model);
    
    // Store device details in the notes field as JSON
    const deviceDetails = {
      brand,
      model
    };
    
    const notesWithDeviceDetails = JSON.stringify({
      userNotes: bookingData.contactInfo.notes || '',
      deviceDetails
    });
    
    // Create a booking record for the purchase
    const booking = await prisma.booking.create({
      data: {
        date: new Date(bookingData.date),
        timeSlot: bookingData.timeSlot,
        name: bookingData.contactInfo.name,
        email: bookingData.contactInfo.email,
        phone: bookingData.contactInfo.phone,
        address: bookingData.contactInfo.address,
        notes: notesWithDeviceDetails, // Use formatted notes with device details
        status: 'CONFIRMED', // For pay on delivery, it's already confirmed
        type: 'PRODUCT', // This is a product purchase, not a repair
        brand: brand, // Still store brand directly
        model: model, // Still store model directly
        totalAmount: totalAmount,
        paymentMethod: 'instore', // Cash on delivery
        paymentStatus: 'PENDING', // Payment will be received on delivery
      }
    });
    
    return NextResponse.json({
      success: true,
      booking: booking
    });
  } catch (_) {
    console.error('Error creating purchase booking:', _);
    return NextResponse.json(
      { error: 'Failed to create booking', details: _ instanceof Error ? _.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 