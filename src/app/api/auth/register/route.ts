import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { validateRequestBody } from "@/lib/validate-request";
import { apiSuccess, apiError, ApiErrors } from "@/lib/api-response";
import { sendVerificationEmail } from "@/lib/email";
import { generateVerificationCode, getVerificationCodeExpiry } from "@/lib/utils/verification";

// Create Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequestBody(request, registerSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { name, email, password, role } = validation.data;

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return apiError(
        "An account with this email already exists",
        "EMAIL_EXISTS",
        409 // Conflict status
      );
    }

    // Hash password with higher cost for security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = getVerificationCodeExpiry();

    // Create user with email verification required
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        email_verified: false,
        verification_code: verificationCode,
        verification_code_expires_at: verificationExpiry.toISOString(),
      })
      .select()
      .single();

    if (userError) {
      console.error("User creation error:", userError);
      return apiError(
        "Failed to create user account",
        "USER_CREATION_FAILED",
        500
      );
    }

    // Send verification email
    try {
      await sendVerificationEmail(email.toLowerCase(), verificationCode, name.trim());
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Don't fail registration if email fails, but log it
      // User can request resend later
    }

    // Create profile based on role (using service role key to bypass RLS)
    if (role === 'TUTOR') {
      const { error: tutorError } = await supabaseAdmin
        .from('tutor_profiles')
        .insert({
          user_id: user.id,
          education: 'Not specified',
          experience: 0,
          location: 'Not specified',
          availability: JSON.stringify({}),
        });

      if (tutorError) {
        console.error("Tutor profile creation error:", tutorError);
      }
    } else {
      const { error: studentError } = await supabaseAdmin
        .from('student_profiles')
        .insert({
          user_id: user.id,
          grade: 'Not specified',
        });

      if (studentError) {
        console.error("Student profile creation error:", studentError);
      }
    }

    return apiSuccess({
      message: "Account created successfully! Please check your email for verification code.",
      userId: user.id,
      emailVerified: false,
    });

  } catch (error) {
    console.error("Registration error:", error);
    return ApiErrors.INTERNAL_ERROR();
  }
} 