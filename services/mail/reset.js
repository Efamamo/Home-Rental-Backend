import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
dotenv.config();

export const sendPasswordResetLink = async (token, user) => {
  console.log(user);
  const resetLink = `http://localhost:3003/api/v1/auth/reset-password?token=${token}`;
  const msg = {
    to: user.email,
    from: `Rentify <${process.env.SENDGRID_SENDER_EMAIL}>`,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <header style="text-align: center; padding-bottom: 20px;">
          <h1 style="color: #4CAF50; margin: 0;">Rentify</h1>
          <p style="color: #555;">Your trusted renting companion</p>
        </header>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #777;">Hello ${user.username},</p>
          <p style="color: #555;">We received a request to reset your Rentify password. Click the link below to proceed. This link will expire in 10 minutes for security reasons.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" style="display: inline-block; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #4CAF50; text-decoration: none; padding: 10px 20px; border-radius: 8px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #555;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          
          <footer style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #aaa;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Rentify. All rights reserved.</p>
          </footer>
        </div>
      </div>
    `,
  };

  await sgMail.send(msg);
};
