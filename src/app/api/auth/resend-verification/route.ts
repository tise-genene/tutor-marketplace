import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { apiSuccess, apiError, ApiErrors } from "@/lib/api-response";
import { sendVerificationEmail } from "@/lib/email";
import { generateVerificationCode, getVerificationCodeExpiry } from "@/lib/utils/verification";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return apiError("Email is required", "MISSING_EMAIL", 400);
    }

    // Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, email_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return apiError("User not found", "USER_NOT_FOUND", 404);
    }

    // Check if already verified
    if (user.email_verified) {
      return apiError("Email is already verified", "ALREADY_VERIFIED", 400);
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = getVerificationCodeExpiry();

    // Update user with new verification code
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_code: verificationCode,
        verification_code_expires_at: verificationExpiry.toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("Verification code update error:", updateError);
      return apiError("Failed to generate new verification code", "CODE_GENERATION_FAILED", 500);
    }

    // Send new verification email
    try {
      await sendVerificationEmail(email.toLowerCase(), verificationCode, user.name);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return apiError("Failed to send verification email", "EMAIL_SEND_FAILED", 500);
    }

    return apiSuccess({
      message: "Verification code sent successfully! Please check your email.",
    });

  } catch (error) {
    console.error("Resend verification error:", error);
    return ApiErrors.INTERNAL_ERROR();
  }
}
