import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { User } from "@/models/User";
import connectDB from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, jobTitle, department, role = "employee" } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !jobTitle || !department) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: passwordHash,
      jobTitle,
      department,
      role,
      permissions: role === "admin" ? ["all"] : [],
    });

    await newUser.save();

    // Return user data without password hash
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      jobTitle: newUser.jobTitle,
      department: newUser.department,
      joinedAt: newUser.joinedAt,
    };

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userResponse
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
