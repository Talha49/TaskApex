import { NextResponse } from 'next/server';
import dbConnect from '@/lib/Mongo/Connectdb';
import User from '@/modals/Users/User';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { getToken } from 'next-auth/jwt';
import { rateLimit } from '../../../../lib/rate-limit';

export async function PUT(req, { params }) {
  await dbConnect();

  const { success } = await rateLimit(req, { max: 100, windowMs: 15 * 60 * 1000 });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { fullName, contact, team, role, password } = await req.json();
    const updateData = { fullName, contact, team, role, updatedBy: token.id, updatedAt: new Date() };

    const validRoles = ["user", "admin", "manager", "readonly"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}`, code: "INVALID_ROLE" }, { status: 400 });
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(params.id, updateData, { new: true });
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found", code: "NOT_FOUND" }, { status: 404 });
    }

    if (password) {
      await sendEmail({
        to: updatedUser.email,
        subject: "Password Updated",
        text: `Hello ${updatedUser.fullName},\nYour password has been updated.\nNew Password: ${password}`,
      });
    }

    return NextResponse.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 });
  }
}

async function sendEmail({ to, subject, text }) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    secure: true,
  });

  const mailOptions = { from: process.env.EMAIL_USER, to, subject, text };
  await transporter.sendMail(mailOptions);
}