import bcrypt from "bcryptjs";
import dbConnect from "@/lib/Mongo/Connectdb";
import User from "@/modals/Users/User";
import { NextResponse } from "next/server";


export async function PUT(req) {
  try {
    await dbConnect();
    const { email, newPassword } = await req.json();

    // Validate input
    if (!email || !newPassword) {
      return NextResponse.json(
        {
          error: "Please fill out all fields",
        },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Hash the new password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      {
        error: "An error occurred while resetting the password",
      },
      { status: 500 }
    );
  }
}