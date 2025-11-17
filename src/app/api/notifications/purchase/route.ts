import { NextResponse } from 'next/server';
import { sendNewPurchaseNotification } from '@/lib/emailUtils';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.brand || !data.model) {
      return NextResponse.json(
        { error: 'Missing required purchase information' },
        { status: 400 }
      );
    }

    // Log the purchase notification
    console.log('Purchase notification:', {
      device: { brand: data.brand, model: data.model },
      price: data.price,
      customerName: data.customerName,
    });
    
    // Send notification to admin
    const emailResult = await sendNewPurchaseNotification(data);
    
    if (emailResult.success) {
      return NextResponse.json({ 
        success: true,
        message: 'Admin notification sent successfully'
      });
    } else {
      // Handle error case
      console.error('Failed to send purchase notification email:', emailResult.error);
      return NextResponse.json(
        { 
          error: 'Failed to send notification email',
          details: emailResult.error
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing purchase notification:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process purchase notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 