import { NextResponse } from 'next/server';
import { sendAdminNotification } from '@/lib/emailUtils';

// Check for environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('Warning: No admin email credentials configured. Using Ethereal test account.');
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the contact request
    console.log('Contact form submission:', {
      name: data.name,
      email: data.email,
      phone: data.phone || 'Not provided',
      subject: data.subject,
      message: data.message.substring(0, 100) + (data.message.length > 100 ? '...' : ''), // Truncate long messages in logs
    });
    
    // Create HTML email content with improved styling
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #5a3c88; border-bottom: 2px solid #5a3c88; padding-bottom: 10px;">New Contact Form Submission</h1>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 120px;">Name:</td>
            <td style="padding: 8px;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Email:</td>
            <td style="padding: 8px;"><a href="mailto:${data.email}" style="color: #5a3c88;">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Phone:</td>
            <td style="padding: 8px;">${data.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Subject:</td>
            <td style="padding: 8px;">${data.subject}</td>
          </tr>
        </table>
        
        <h2 style="color: #5a3c88; margin-top: 20px;">Message:</h2>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; line-height: 1.5;">
          ${data.message.replace(/\n/g, '<br/>')}
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #6c757d; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 10px;">
          This email was sent from the contact form on iRescue website. | ${new Date().toLocaleString()}
        </p>
      </div>
    `;
    
    // Plain text version
    const textContent = `
      New Contact Form Submission
      
      Name: ${data.name}
      Email: ${data.email}
      Phone: ${data.phone || 'Not provided'}
      Subject: ${data.subject}
      
      Message:
      ${data.message}
      
      This email was sent from the contact form on iRescue website.
      ${new Date().toLocaleString()}
    `;

    // Send email using our utility function
    const emailResult = await sendAdminNotification(
      `New contact form: ${data.subject}`, 
      htmlContent, 
      textContent,
      data.email // Use the customer's email as reply-to
    );
    
    if (emailResult.success) {
      return NextResponse.json({ 
        success: true,
        message: 'Your message has been sent successfully!'
      });
    } else {
      // Handle error case
      console.error('Failed to send email:', emailResult.error);
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: emailResult.error
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process contact form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 