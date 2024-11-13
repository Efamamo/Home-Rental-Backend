import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerification = async (user) => {
  const otp = user.otp;
  const msg = {
    to: user.email,
    from: `Rentify <${process.env.SENDGRID_SENDER_EMAIL}>`,
    subject: 'Your OTP for Rentify',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <header style="text-align: center; padding-bottom: 20px;">
          <h1 style="color: #4CAF50; margin: 0;">Rentify</h1>
          <p style="color: #555;">Your trusted rent companion</p>
        </header>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p style="color: #777;">Hi ${user.username},</p>
          <p style="color: #555;">Thank you for signing up with Rentify! Please enter the OTP below to verify your email address. This code is valid for the next 10 minutes.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; letter-spacing: 4px; padding: 10px 20px; border: 2px dashed #4CAF50; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          
          <p style="color: #555;">If you didn't request this email, please ignore it.</p>
          
          <footer style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #aaa;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Rentify. All rights reserved.</p>
          </footer>
        </div>
      </div>
    `,
  };
  await sgMail.send(msg);
};

export default sendVerification;
