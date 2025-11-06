import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { validateRequestBody } from "@/lib/validate-request";
import { apiSuccess, apiError, ApiErrors } from "@/lib/api-response";
import { sendVerificationEmail } from "@/lib/email";
import { generateVerificationCode, getVerificationCodeExpiry } from "@/lib/utils/verification";

// Validate Supabase environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✅ Set' : '❌ Missing');
} else {
  console.log('✅ Supabase environment variables loaded');
  console.log('  URL:', supabaseUrl);
  console.log('  Service Role Key:', supabaseServiceRoleKey.substring(0, 20) + '...');
}

// Create Supabase client with service role key for admin operations
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey ? createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null;

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequestBody(request, registerSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { name, email, password, role } = validation.data;

    // Use admin client for user operations (bypasses RLS)
    if (!supabaseAdmin) {
      console.error("Supabase admin client not initialized - missing environment variables");
      return apiError(
        "Server configuration error: Missing Supabase service role key",
        "CONFIG_ERROR",
        500
      );
    }

    // Check if user already exists (using admin client)
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (checkError) {
      console.error("❌ Error checking existing user:", checkError);
      console.error("  Error message:", checkError.message);
      console.error("  Error details:", checkError.details);
      console.error("  Supabase URL:", supabaseUrl);
      console.error("  This usually means:");
      console.error("    1. Wrong NEXT_PUBLIC_SUPABASE_URL in .env.local");
      console.error("    2. Wrong SUPABASE_SERVICE_ROLE_KEY in .env.local");
      console.error("    3. Network connectivity issue");
      return apiError(
        `Failed to check user existence: ${checkError.message || 'Connection failed'}`,
        "CHECK_USER_ERROR",
        500
      );
    }

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

    // Create user with email verification required (using admin client)
    const { data: user, error: userError } = await supabaseAdmin
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
      console.error("User creation error:", {
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        code: userError.code,
      });
      return apiError(
        `Failed to create user account: ${userError.message || 'Unknown error'}`,
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

    // Create Better Auth user (required for login to work)
    // Better Auth uses its own user table and account table for credentials
    // Convert UUID to string for Better Auth (it uses TEXT, not UUID)
    const betterAuthUserId = String(user.id);
    
    try {
      // Create Better Auth user
      const { error: betterAuthUserError } = await supabaseAdmin
        .from('user')
        .insert({
          id: betterAuthUserId,
          name: name.trim(),
          email: email.toLowerCase(),
          email_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (betterAuthUserError) {
        console.error("Better Auth user creation error:", betterAuthUserError);
        // Continue anyway - user can still use the app
      }

      // Create Better Auth account with password (for credentials login)
      // Better Auth stores passwords in the account table with provider_id: "credential"
      const { error: betterAuthAccountError } = await supabaseAdmin
        .from('account')
        .insert({
          id: `${betterAuthUserId}-credential`,
          account_id: email.toLowerCase(),
          provider_id: 'credential',
          user_id: betterAuthUserId,
          password: hashedPassword, // Better Auth expects hashed password
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (betterAuthAccountError) {
        console.error("Better Auth account creation error:", betterAuthAccountError);
        // Continue anyway - user can still use the app
      } else {
        console.log("✅ Better Auth user and account created successfully");
      }
    } catch (betterAuthError) {
      console.error("Error creating Better Auth user:", betterAuthError);
      // Continue anyway - registration succeeded, just Better Auth sync failed
    }

    // Create profile based on role (using admin client)
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return apiError(
      `Registration failed: ${errorMessage}`,
      "REGISTRATION_ERROR",
      500
    );
  }
} 