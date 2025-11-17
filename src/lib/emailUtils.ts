import nodemailer from 'nodemailer';

// Define interface for NodeMailer error
export interface NodemailerError extends Error {
  code?: string;
  response?: string;
  responseCode?: number;
}

// Define interfaces for data structures to replace 'any' types

// Interface for phone listing data
export interface ListingData {
  id?: string;
  brand: string;
  model: string;
  storage?: string;
  condition?: string;
  color?: string;
  price?: number;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
}

// Interface for repair request data
export interface RepairData {
  brand: string;
  model: string;
  issues: string[] | string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  date?: Date | string | null;
  timeSlot?: string;
  totalAmount?: number;
  notes?: string;
}

// Interface for purchase data
export interface PurchaseData {
  brand: string;
  model: string;
  price?: number;
  condition?: string;
  storage?: string;
  color?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMethod?: 'online' | 'instore';
  notes?: string;
}

// Create a transporter object based on available credentials
export const createTransporter = () => {
  // Check if we have email configuration
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    // Determine email service based on email address
    const emailUser = process.env.EMAIL_USER.toLowerCase();
    
    // Gmail configuration
    if (emailUser.includes('@gmail.com')) {
      console.log('Using Gmail transport configuration');
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD, // This should be an App Password for Gmail
        },
        // Don't use debug/logger in production
        ...(process.env.NODE_ENV !== 'production' && {
          debug: true,
          logger: true
        })
      });
    }
    
    // Outlook/Hotmail configuration
    else if (emailUser.includes('@outlook.com') || emailUser.includes('@hotmail.com')) {
      console.log('Using Outlook transport configuration');
      return nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, // use TLS
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        }
      });
    }
    
    // Yahoo configuration
    else if (emailUser.includes('@yahoo.com')) {
      console.log('Using Yahoo transport configuration');
      return nodemailer.createTransport({
        service: 'yahoo',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
    
    // Default to generic SMTP setup
    else {
      console.log('Using generic SMTP transport configuration');
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp-mail.outlook.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }
  
  // Fallback to Ethereal for testing (creates a temporary test account)
  console.warn('Email credentials not configured. Using Ethereal Email for testing.');
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email', // will be replaced by Ethereal
      pass: 'ethereal.pass', // will be replaced by Ethereal
    },
  });
};

// Get emails from env or use fallback
export const getContactEmail = (): string => {
  return process.env.EMAIL_CONTACT_RECEIVER || 'contact@irescueathens.com';
};

export const getSalesEmail = (): string => {
  return process.env.EMAIL_SALES_RECEIVER || 'delivery@irescueathens.com';
};

// Send email notification to admin
export const sendAdminNotification = async (
    subject: string,
    htmlContent: string,
    textContent: string,
    replyTo?: string,
    recipientOverride?: string
) => {
  try {
    // Create nodemailer test account if needed and get transporter
    let testAccount;
    let transporter;
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Created Ethereal test account:', testAccount.user);
    } else {
      transporter = createTransporter();
    }
    
    // Email content
    const mailOptions = {
      from: `"iRescue Automatic Message" <${process.env.EMAIL_SENDER || process.env.EMAIL_USER || 'no-reply@irescueathens.com'}>`,
      to: recipientOverride || getContactEmail(),
      ...(replyTo && { replyTo }),
      subject,
      html: htmlContent,
      text: textContent,
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // If using Ethereal, provide the test URL to view the email
    if (testAccount) {
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
      return {
        success: true,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    } else {
      console.log('Email sent successfully:', info.messageId);
      return { success: true };
    }
  } catch (emailError) {
    console.error('Error sending notification email:', emailError);
    
    // Log detailed error for debugging
    const mailerError = emailError as NodemailerError;
    console.error('Email error details:', {
      code: mailerError.code,
      response: mailerError.response,
      responseCode: mailerError.responseCode,
    });
    
    return { 
      success: false, 
      error: emailError instanceof Error ? emailError.message : 'Unknown email error'
    };
  }
};

// Send notification about new phone listing
export const sendNewListingNotification = async (listingData: ListingData) => {
  const subject = `New Phone Listing: ${listingData.brand} ${listingData.model}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h1 style="color: #5a3c88; border-bottom: 2px solid #5a3c88; padding-bottom: 10px;">New Phone Listing Submitted</h1>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; width: 140px;">Brand:</td>
          <td style="padding: 8px;">${listingData.brand}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Model:</td>
          <td style="padding: 8px;">${listingData.model}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Storage:</td>
          <td style="padding: 8px;">${listingData.storage || 'Not specified'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Condition:</td>
          <td style="padding: 8px;">${listingData.condition || 'Not specified'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Color:</td>
          <td style="padding: 8px;">${listingData.color || 'Not specified'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Price:</td>
          <td style="padding: 8px;">${listingData.price ? `${listingData.price}€` : 'Not specified'}</td>
        </tr>
      </table>
      
      ${listingData.description ? `
        <h2 style="color: #5a3c88; margin-top: 20px;">Description:</h2>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; line-height: 1.5;">
          ${listingData.description.replace(/\n/g, '<br/>')}
        </div>
      ` : ''}
      
      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.irescueathens.com'}/admin/listings" 
           style="background-color: #5a3c88; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          View in Admin Dashboard
        </a>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #6c757d; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 10px;">
        This is an automated notification from the iRescue website. | ${new Date().toLocaleString()}
      </p>
    </div>
  `;
  
  const textContent = `
    New Phone Listing Submitted
    
    Brand: ${listingData.brand}
    Model: ${listingData.model}
    Storage: ${listingData.storage || 'Not specified'}
    Condition: ${listingData.condition || 'Not specified'}
    Color: ${listingData.color || 'Not specified'}
    Price: ${listingData.price ? `${listingData.price}€` : 'Not specified'}
    
    ${listingData.description ? `Description:\n${listingData.description}\n` : ''}
    
    Please check the admin dashboard to review this listing.
    ${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.irescueathens.com'}/admin/listings
    
    This is an automated notification from the iRescue website.
    ${new Date().toLocaleString()}
  `;
  
  return sendAdminNotification(subject, htmlContent, textContent);
};

// Send notification about new repair request
export const sendNewRepairNotification = async (repairData: RepairData) => {
  const subject = `New Repair Request: ${repairData.brand} ${repairData.model}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h1 style="color: #5a3c88; border-bottom: 2px solid #5a3c88; padding-bottom: 10px;">New Repair Request</h1>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; width: 140px;">Device:</td>
          <td style="padding: 8px;">${repairData.brand} ${repairData.model}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Issues:</td>
          <td style="padding: 8px;">${Array.isArray(repairData.issues) ? repairData.issues.join(', ') : repairData.issues || 'Not specified'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Customer:</td>
          <td style="padding: 8px;">${repairData.customerName || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Contact:</td>
          <td style="padding: 8px;">
            ${repairData.customerEmail ? `Email: ${repairData.customerEmail}<br>` : ''}
            ${repairData.customerPhone ? `Phone: ${repairData.customerPhone}` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Appointment:</td>
          <td style="padding: 8px;">
            ${repairData.date ? `Date: ${new Date(repairData.date).toLocaleDateString()}<br>` : ''}
            ${repairData.timeSlot ? `Time: ${repairData.timeSlot}` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Total:</td>
          <td style="padding: 8px;">${typeof repairData.totalAmount === 'number' ? `${repairData.totalAmount}€` : 'To be determined'}</td>
        </tr>
      </table>
      
      ${repairData.notes ? `
        <h2 style="color: #5a3c88; margin-top: 20px;">Customer Notes:</h2>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; line-height: 1.5;">
          ${repairData.notes.replace(/\n/g, '<br/>')}
        </div>
      ` : ''}
      
      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.irescueathens.com'}/admin/repairs" 
           style="background-color: #5a3c88; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          View in Admin Dashboard
        </a>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #6c757d; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 10px;">
        This is an automated notification from the iRescue website. | ${new Date().toLocaleString()}
      </p>
    </div>
  `;
  
  const textContent = `
    New Repair Request
    
    Device: ${repairData.brand} ${repairData.model}
    Issues: ${Array.isArray(repairData.issues) ? repairData.issues.join(', ') : repairData.issues || 'Not specified'}
    Customer: ${repairData.customerName || 'Not provided'}
    Contact: ${repairData.customerEmail || ''} ${repairData.customerPhone || ''}
    Appointment: ${repairData.date ? new Date(repairData.date).toLocaleDateString() : ''} ${repairData.timeSlot || ''}
    Total: ${typeof repairData.totalAmount === 'number' ? `${repairData.totalAmount}€` : 'To be determined'}
    
    ${repairData.notes ? `Customer Notes:\n${repairData.notes}\n` : ''}
    
    Please check the admin dashboard to review this repair request.
    ${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.irescueathens.com'}/admin/repairs
    
    This is an automated notification from the iRescue website.
    ${new Date().toLocaleString()}
  `;
  
  return sendAdminNotification(subject, htmlContent, textContent, undefined, getSalesEmail());
};

// Send notification about new phone purchase
export const sendNewPurchaseNotification = async (purchaseData: PurchaseData) => {
  const subject = `New Phone Purchase: ${purchaseData.brand} ${purchaseData.model}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h1 style="color: #5a3c88; border-bottom: 2px solid #5a3c88; padding-bottom: 10px;">New Phone Purchase</h1>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; width: 140px;">Device:</td>
          <td style="padding: 8px;">${purchaseData.brand} ${purchaseData.model}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Price:</td>
          <td style="padding: 8px;">${typeof purchaseData.price === 'number' ? `${purchaseData.price}€` : 'Not specified'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Customer:</td>
          <td style="padding: 8px;">${purchaseData.customerName || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Contact:</td>
          <td style="padding: 8px;">
            ${purchaseData.customerEmail ? `Email: ${purchaseData.customerEmail}<br>` : ''}
            ${purchaseData.customerPhone ? `Phone: ${purchaseData.customerPhone}` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Payment Method:</td>
          <td style="padding: 8px;">${purchaseData.paymentMethod === 'online' ? 'Online Payment' : 'In-store Payment'}</td>
        </tr>
      </table>
      
      ${purchaseData.notes ? `
        <h2 style="color: #5a3c88; margin-top: 20px;">Customer Notes:</h2>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; line-height: 1.5;">
          ${purchaseData.notes.replace(/\n/g, '<br/>')}
        </div>
      ` : ''}
      
      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.irescueathens.com'}/admin/sales" 
           style="background-color: #5a3c88; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          View in Admin Dashboard
        </a>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #6c757d; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 10px;">
        This is an automated notification from the iRescue website. | ${new Date().toLocaleString()}
      </p>
    </div>
  `;
  
  const textContent = `
    New Phone Purchase
    
    Device: ${purchaseData.brand} ${purchaseData.model}
    Price: ${typeof purchaseData.price === 'number' ? `${purchaseData.price}€` : 'Not specified'}
    Customer: ${purchaseData.customerName || 'Not provided'}
    Contact: ${purchaseData.customerEmail || ''} ${purchaseData.customerPhone || ''}
    Payment Method: ${purchaseData.paymentMethod === 'online' ? 'Online Payment' : 'In-store Payment'}
    
    ${purchaseData.notes ? `Customer Notes:\n${purchaseData.notes}\n` : ''}
    
    Please check the admin dashboard to review this purchase.
    ${process.env.NEXT_PUBLIC_SITE_URL || 'https://irescue.gr'}/admin/sales
    
    This is an automated notification from the iRescue website.
    ${new Date().toLocaleString()}
  `;
  
  return sendAdminNotification(subject, htmlContent, textContent);
};