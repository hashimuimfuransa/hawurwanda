import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'info@excellencecoachinghub.com';

console.log('SendGrid API Key configured:', !!SENDGRID_API_KEY);
console.log('From Email:', FROM_EMAIL);

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('SendGrid API key set successfully');
} else {
  console.error('SendGrid API key is not configured');
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using SendGrid
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    console.log('Attempting to send email to:', options.to);
    console.log('Subject:', options.subject);
    
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key is not configured');
      return false;
    }

    const msg = {
      to: options.to,
      from: FROM_EMAIL,
      subject: options.subject,
      text: options.text || '',
      html: options.html,
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error: any) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    return false;
  }
};

/**
 * Send salon approval email
 */
export const sendSalonApprovalEmail = async (
  ownerEmail: string,
  ownerName: string,
  salonName: string
): Promise<boolean> => {
  const subject = `🎉 Your Salon "${salonName}" Has Been Approved!`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Salon Approved</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    🎉 Congratulations!
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                    Hello ${ownerName},
                  </h2>
                  
                  <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    We're excited to inform you that your salon <strong style="color: #10b981;">"${salonName}"</strong> has been successfully verified and approved!
                  </p>
                  
                  <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0;">
                    <p style="margin: 0; color: #166534; font-size: 16px; font-weight: 600;">
                      ✅ Your salon is now live on HAWU Rwanda!
                    </p>
                  </div>
                  
                  <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 18px;">
                    What's Next?
                  </h3>
                  
                  <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
                    <li>Your salon is now visible to customers on our platform</li>
                    <li>You can start receiving bookings immediately</li>
                    <li>Manage your services, staff, and availability from your dashboard</li>
                    <li>Monitor your bookings and revenue in real-time</li>
                  </ul>
                  
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                       style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Go to Dashboard
                    </a>
                  </div>
                  
                  <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    If you have any questions or need assistance, please don't hesitate to contact our support team.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                    Best regards,<br>
                    <strong style="color: #1f2937;">HAWU Rwanda Team</strong>
                  </p>
                  <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} HAWU Rwanda. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Congratulations ${ownerName}!
    
    Your salon "${salonName}" has been successfully verified and approved!
    
    Your salon is now live on HAWU Rwanda and you can start receiving bookings immediately.
    
    Visit your dashboard at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard
    
    Best regards,
    HAWU Rwanda Team
  `;

  return sendEmail({
    to: ownerEmail,
    subject,
    html,
    text,
  });
};

/**
 * Send salon rejection email
 */
export const sendSalonRejectionEmail = async (
  ownerEmail: string,
  ownerName: string,
  salonName: string,
  reason?: string
): Promise<boolean> => {
  const subject = `Update on Your Salon "${salonName}" Application`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Salon Application Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    Application Update
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                    Hello ${ownerName},
                  </h2>
                  
                  <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thank you for your interest in joining HAWU Rwanda. After careful review, we regret to inform you that your salon <strong>"${salonName}"</strong> application could not be approved at this time.
                  </p>
                  
                  ${reason ? `
                  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 30px 0;">
                    <p style="margin: 0; color: #991b1b; font-size: 16px;">
                      <strong>Reason:</strong> ${reason}
                    </p>
                  </div>
                  ` : ''}
                  
                  <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 18px;">
                    What Can You Do?
                  </h3>
                  
                  <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
                    <li>Review the requirements for salon registration</li>
                    <li>Update your salon information and documentation</li>
                    <li>Resubmit your application once you've addressed the concerns</li>
                    <li>Contact our support team if you need clarification</li>
                  </ul>
                  
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact" 
                       style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Contact Support
                    </a>
                  </div>
                  
                  <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    We appreciate your understanding and hope to work with you in the future.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                    Best regards,<br>
                    <strong style="color: #1f2937;">HAWU Rwanda Team</strong>
                  </p>
                  <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} HAWU Rwanda. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Hello ${ownerName},
    
    Thank you for your interest in joining HAWU Rwanda. After careful review, we regret to inform you that your salon "${salonName}" application could not be approved at this time.
    
    ${reason ? `Reason: ${reason}` : ''}
    
    You can review the requirements, update your information, and resubmit your application.
    
    Contact our support team if you need assistance: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact
    
    Best regards,
    HAWU Rwanda Team
  `;

  return sendEmail({
    to: ownerEmail,
    subject,
    html,
    text,
  });
};