import { NextResponse } from 'next/server';
import { sendNewRepairNotification } from '@/lib/emailUtils';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.brand || !data.model || !data.issues) {
      return NextResponse.json(
        { error: 'Missing required repair information' },
        { status: 400 }
      );
    }

    // Log the repair request
    console.log('Repair request notification:', {
      device: { brand: data.brand, model: data.model },
      issues: data.issues,
      customerName: data.customerName,
    });
    
    // Send notification to admin
    const emailResult = await sendNewRepairNotification(data);
    
    if (emailResult.success) {
      return NextResponse.json({ 
        success: true,
        message: 'Admin notification sent successfully'
      });
    } else {
      // Handle error case
      console.error('Failed to send repair notification email:', emailResult.error);
      return NextResponse.json(
        { 
          error: 'Failed to send notification email',
          details: emailResult.error
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing repair notification:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process repair notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 