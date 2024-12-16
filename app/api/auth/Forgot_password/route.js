import dbConnect from "@/lib/Mongo/Connectdb";
import User from "@/modals/Users/User";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer"


export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required." });
  }

  try {
    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({
        error: "No account with that email address exists.",
      });
    }

  
    // Generate a 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. Please use this code to reset your password. The code is valid for 10 minutes.`,
    };

    // Send the email with OTP
    await transporter.sendMail(mailOptions);

    // Return the OTP to the client (in practice, you might not want to send the OTP back)
    return NextResponse.json({
      message: "OTP sent to your email.",
      otp,
    });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return NextResponse.json({
      error: "Failed to send OTP. Please try again.",
    });
  }
}