import dbConnect from "@/lib/Mongo/Connectdb";
import User from "@/modals/Users/User";
import Tenant from "@/modals/Tenant/Tenant";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  const { email, companyName } = await req.json();

  if (!email || !companyName) {
    return NextResponse.json({ error: "Email and Company Name are required." });
  }

  try {
    await dbConnect();
    const tenant = await Tenant.findOne({ name: companyName });
    if (!tenant) {
      return NextResponse.json({ error: "Company not found." });
    }

    const user = await User.findOne({ email, tenantId: tenant._id });
    if (!user) {
      return NextResponse.json({ error: "No account with that email exists in this company." });
    }

    const otp = Math.floor(10000 + Math.random() * 90000).toString();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. Please use this code to reset your password. The code is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "OTP sent to your email.", otp });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return NextResponse.json({ error: "Failed to send OTP. Please try again." });
  }
}