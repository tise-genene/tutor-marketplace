import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string, name: string) {
  try {
    // In testing mode, Resend only allows sending to verified emails
    // We'll send to the verified email and include the actual recipient in the subject
    const { data, error } = await resend.emails.send({
      from: 'Tutorly <onboarding@resend.dev>',
      to: ['tisegenene@gmail.com'], // Use verified email for testing
      subject: `Verify your Tutorly account - Code for ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">Tutorly</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Verify your email address</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Welcome to Tutorly, ${name}!</h2>
            <p style="color: #4b5563; margin: 0 0 30px 0; line-height: 1.6;">
              Thank you for creating your account. To complete your registration, please enter the verification code below:
            </p>
            
            <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
              This code will expire in 15 minutes for security reasons.
            </p>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                <strong>Testing Mode:</strong> This verification code is for ${email}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Email sending error:', error);
      const errorMessage = (error as any).error || error.message || 'Unknown error';
      throw new Error(`Failed to send verification email: ${errorMessage}`);
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw new Error(`Email service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function sendPasswordResetEmail(email: string, code: string, name: string) {
  try {
    // In testing mode, Resend only allows sending to verified emails
    const { data, error } = await resend.emails.send({
      from: 'Tutorly <onboarding@resend.dev>',
      to: ['tisegenene@gmail.com'], // Use verified email for testing
      subject: `Reset your Tutorly password - Code for ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">Tutorly</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Password reset request</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hello ${name}!</h2>
            <p style="color: #4b5563; margin: 0 0 30px 0; line-height: 1.6;">
              We received a request to reset your password. Use the verification code below to create a new password:
            </p>
            
            <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
              This code will expire in 15 minutes for security reasons.
            </p>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                <strong>Testing Mode:</strong> This password reset code is for ${email}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Email sending error:', error);
      const errorMessage = (error as any).error || error.message || 'Unknown error';
      throw new Error(`Failed to send password reset email: ${errorMessage}`);
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw new Error(`Email service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
