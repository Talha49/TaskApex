import dbConnect from '@/lib/Mongo/Connectdb';
import User from '@/modals/Users/User';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req) {
  await dbConnect();
  const { success } = await rateLimit(req, { max: 100, windowMs: 15 * 60 * 1000 });
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { fullName, email, password, contact, team, role, tenantId } = await req.json();
    if (!fullName || !email || !password || !tenantId) {
      return NextResponse.json({ error: "Missing required fields", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (tenantId !== token.tenantId) {
      return NextResponse.json({ error: "Invalid tenant" }, { status: 403 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return NextResponse.json({ error: "User already exists", code: "DUPLICATE_EMAIL" }, { status: 409 });

    const validRoles = ["user", "admin", "manager", "readonly"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}`, code: "INVALID_ROLE" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      contact: contact || "",
      team: team || "",
      role,
      tenantId,
      createdBy: token.id,
      createdAt: new Date(),
    });

    await user.save();
    await sendEmail({ to: email, subject: "Your Account Credentials", text: `Welcome, ${fullName}!\nEmail: ${email}\nPassword: ${password}\nLogin at: ${process.env.NEXT_PUBLIC_APP_URL}/Auth` });

    return NextResponse.json({ message: "User created successfully", user: { id: user._id, email, role } }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
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