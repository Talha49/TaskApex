import dbConnect from "@/lib/Mongo/Connectdb";
import User from "@/modals/Users/User";
import Tenant from "@/modals/Tenant/Tenant";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    await dbConnect();
    const { email, companyName } = await req.json();

    if (!email || !companyName) {
      return NextResponse.json({ error: "Email and Company Name are required" }, { status: 400 });
    }

    const tenant = await Tenant.findOne({ name: companyName });
    if (!tenant) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const user = await User.findOne({ email, tenantId: tenant._id });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.isVerified = true;
    await user.save();

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}