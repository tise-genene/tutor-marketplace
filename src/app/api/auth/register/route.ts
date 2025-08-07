import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
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
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }, // Normalize email
    });

    if (existingUser) {
      return apiError(
        "An account with this email already exists",
        "EMAIL_EXISTS",
        409 // Conflict status
      );
    }

    // Hash password with higher cost for security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user transaction (all or nothing)
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase(),
          password: hashedPassword,
          role,
        },
      });

      // Create profile based on role
      if (role === "TUTOR") {
        await tx.tutorProfile.create({
          data: {
            userId: user.id,
            bio: null,
            education: "[]", // Empty JSON array as string for education history
            experience: 0,
            location: "",
            availability: {},
            isVerified: false,
            rating: 0,
            totalReviews: 0,
          },
        });
      } else if (role === "STUDENT") {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            grade: null,
          },
        });
      }

      return user;
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result;

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
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return apiError(
        "An account with this email already exists",
        "EMAIL_EXISTS",
        409
      );
    }

    return ApiErrors.INTERNAL_ERROR();
  }
} 