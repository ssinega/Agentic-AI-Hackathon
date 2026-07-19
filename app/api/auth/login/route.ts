import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Login request body:", { email: body.email, passwordLength: body.password?.length });

    // Validate input using the schema
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      console.log("Validation failed:", result.error.errors);
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    console.log("Validated login attempt for email:", email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("User found:", { id: user.id, email: user.email });

    // Verify password
    console.log("Comparing passwords...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("Password mismatch for user:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Return user data and set auth cookie
    console.log("Login successful for user:", email);
    
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie for authentication
    response.cookies.set({
      name: "auth_token",
      value: JSON.stringify({ id: user.id, email: user.email }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
