import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { validateRequestBody } from "@/lib/validate-request";
import { apiSuccess, apiError, ApiErrors } from "@/lib/api-response";

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

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
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

    // Create profile based on role
    if (role === "TUTOR") {
      const { error: profileError } = await supabase
        .from('tutor_profiles')
        .insert({
          user_id: user.id,
          bio: null,
          education: "[]", // Empty JSON array as string for education history
          experience: 0,
          location: "",
          availability: "{}",
          is_verified: false,
          rating: 0,
          total_reviews: 0,
        });

      if (profileError) {
        console.error("Tutor profile creation error:", profileError);
        // Don't fail the registration, just log the error
      }
    } else if (role === "STUDENT") {
      const { error: profileError } = await supabase
        .from('student_profiles')
        .insert({
          user_id: user.id,
          grade: null,
        });

      if (profileError) {
        console.error("Student profile creation error:", profileError);
        // Don't fail the registration, just log the error
      }
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return apiSuccess(
      {
        message: "Account created successfully",
        user: userWithoutPassword,
      },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle specific database errors
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return apiError(
        "An account with this email already exists",
        "EMAIL_EXISTS",
        409
      );
    }

    return ApiErrors.INTERNAL_ERROR();
  }
} 