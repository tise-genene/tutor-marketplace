import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const handler = toNextJsHandler(auth);

// Wrap handlers with error handling
export async function GET(request: NextRequest) {
  try {
    return await handler.GET(request);
  } catch (error: any) {
    console.error("Better Auth GET error:", error);
    return NextResponse.json(
      { 
        error: "Authentication error",
        message: error?.message || "An error occurred",
        ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handler.POST(request);
  } catch (error: any) {
    console.error("Better Auth POST error:", error);
    return NextResponse.json(
      { 
        error: "Authentication error",
        message: error?.message || "An error occurred",
        ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
      },
      { status: 500 }
    );
  }
}