import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { apiSuccess, apiError, ApiErrors } from "@/lib/api-response";
import { isVerificationCodeExpired, validateVerificationCode } from "@/lib/utils/verification";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    // Validate input
    if (!email || !code) {
      return apiError("Email and verification code are required", "MISSING_FIELDS", 400);
    }

    if (!validateVerificationCode(code)) {
      return apiError("Invalid verification code format", "INVALID_CODE_FORMAT", 400);
    }

    // Find user with the email and verification code
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, verification_code, verification_code_expires_at, email_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return apiError("User not found", "USER_NOT_FOUND", 404);
    }

    // Check if already verified
    if (user.email_verified) {
      return apiError("Email is already verified", "ALREADY_VERIFIED", 400);
    }

    // Check if verification code matches
    if (user.verification_code !== code) {
      return apiError("Invalid verification code", "INVALID_CODE", 400);
    }

    // Check if code is expired
    if (isVerificationCodeExpired(user.verification_code_expires_at)) {
      return apiError("Verification code has expired", "CODE_EXPIRED", 400);
    }

    // Mark email as verified and clear verification code
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_code: null,
        verification_code_expires_at: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("Email verification update error:", updateError);
      return apiError("Failed to verify email", "VERIFICATION_FAILED", 500);
    }

    return apiSuccess({
      message: "Email verified successfully! You can now sign in.",
      emailVerified: true,
    });

  } catch (error) {
    console.error("Email verification error:", error);
    return ApiErrors.INTERNAL_ERROR();
  }
}
