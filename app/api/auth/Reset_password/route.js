import bcrypt from "bcryptjs";
import dbConnect from "@/lib/Mongo/Connectdb";
import User from "@/modals/Users/User";
import Tenant from "@/modals/Tenant/Tenant";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    await dbConnect();
    const { email, newPassword, companyName } = await req.json();

    if (!email || !newPassword || !companyName) {
      return NextResponse.json({ error: "Please fill out all fields" }, { status: 400 });
    }

    const tenant = await Tenant.findOne({ name: companyName });
    if (!tenant) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const user = await User.findOne({ email, tenantId: tenant._id });
    if (!user) {
      return NextResponse.json({ error: "User not found in this company" }, { status: 404 });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "An error occurred while resetting the password" }, { status: 500 });
  }
}