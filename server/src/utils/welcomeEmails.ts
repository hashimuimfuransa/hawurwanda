import { sendEmail } from './emailService';

/**
 * Send welcome email to new staff member
 */
export const sendStaffWelcomeEmail = async (
  staffEmail: string,
  staffName: string,
  salonName: string,
  password: string,
  staffCategory: string
): Promise<boolean> => {
  const subject = `Welcome to ${salonName} - Your Staff Account is Ready!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to HAWU Rwanda!</h1>
        <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your staff account has been created</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Hello ${staffName}! 👋</h2>
        
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Congratulations! You have been added as a <strong>${staffCategory}</strong> to <strong>${salonName}</strong> on the HAWU Rwanda platform.
        </p>
        
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Your Login Credentials:</h3>
          <p style="color: #475569; margin: 5px 0; font-size: 14px;"><strong>Email:</strong> ${staffEmail}</p>
          <p style="color: #475569; margin: 5px 0; font-size: 14px;"><strong>Password:</strong> ${password}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500;">
            ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
             style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
            Login to Your Account
          </a>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 30px;">
          <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h3>
          <ul style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Log in to your account using the credentials above</li>
            <li>Complete your profile setup</li>
            <li>Set your availability schedule</li>
            <li>Start managing bookings and serving clients</li>
          </ul>
        </div>
        
        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 30px;">
          If you have any questions or need assistance, please don't hesitate to contact your salon owner or our support team.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
        <p>This email was sent by HAWU Rwanda - Connecting Beauty Professionals Across Rwanda</p>
        <p>© 2024 HAWU Rwanda. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
    Welcome to HAWU Rwanda!
    
    Hello ${staffName},
    
    Congratulations! You have been added as a ${staffCategory} to ${salonName} on the HAWU Rwanda platform.
    
    Your Login Credentials:
    Email: ${staffEmail}
    Password: ${password}
    
    Important: Please change your password after your first login for security purposes.
    
    Login to your account: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login
    
    What's Next?
    - Log in to your account using the credentials above
    - Complete your profile setup
    - Set your availability schedule
    - Start managing bookings and serving clients
    
    If you have any questions, please contact your salon owner or our support team.
    
    Best regards,
    HAWU Rwanda Team
  `;

  return sendEmail({
    to: staffEmail,
    subject,
    html,
    text,
  });
};

/**
 * Send welcome email to new salon owner
 */
export const sendOwnerWelcomeEmail = async (
  ownerEmail: string,
  ownerName: string,
  salonName: string,
  password: string
): Promise<boolean> => {
  const subject = `Welcome to HAWU Rwanda - Your Salon Owner Account is Ready!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to HAWU Rwanda!</h1>
        <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your salon owner account has been created</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Hello ${ownerName}! 👋</h2>
        
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Congratulations! Your salon <strong>${salonName}</strong> has been successfully registered on the HAWU Rwanda platform, and you are now the proud owner!
        </p>
        
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Your Login Credentials:</h3>
          <p style="color: #475569; margin: 5px 0; font-size: 14px;"><strong>Email:</strong> ${ownerEmail}</p>
          <p style="color: #475569; margin: 5px 0; font-size: 14px;"><strong>Password:</strong> ${password}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500;">
            ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
             style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
            Access Your Owner Dashboard
          </a>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 30px;">
          <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">What You Can Do:</h3>
          <ul style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Manage your salon profile and information</li>
            <li>Add and manage your staff members</li>
            <li>Set up your services and pricing</li>
            <li>Manage bookings and appointments</li>
            <li>View analytics and reports</li>
            <li>Update your working hours and availability</li>
          </ul>
        </div>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px;">🎉 Your Salon is Now Live!</h3>
          <p style="color: #047857; margin: 0; font-size: 14px;">
            Clients can now discover and book appointments at your salon through our platform.
          </p>
        </div>
        
        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 30px;">
          If you have any questions or need assistance setting up your salon, please don't hesitate to contact our support team.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
        <p>This email was sent by HAWU Rwanda - Connecting Beauty Professionals Across Rwanda</p>
        <p>© 2024 HAWU Rwanda. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
    Welcome to HAWU Rwanda!
    
    Hello ${ownerName},
    
    Congratulations! Your salon ${salonName} has been successfully registered on the HAWU Rwanda platform, and you are now the proud owner!
    
    Your Login Credentials:
    Email: ${ownerEmail}
    Password: ${password}
    
    Important: Please change your password after your first login for security purposes.
    
    Access your owner dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login
    
    What You Can Do:
    - Manage your salon profile and information
    - Add and manage your staff members
    - Set up your services and pricing
    - Manage bookings and appointments
    - View analytics and reports
    - Update your working hours and availability
    
    Your salon is now live! Clients can discover and book appointments at your salon through our platform.
    
    If you have any questions, please contact our support team.
    
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
