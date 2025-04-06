import dbConnect from '@/lib/Mongo/Connectdb';
import User from '@/modals/Users/User';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req) {
  await dbConnect();
  const { success } = await rateLimit(req, { max: 100, windowMs: 15 * 60 * 1000 });
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");
    if (tenantId !== token.tenantId) return NextResponse.json({ error: "Invalid tenant" }, { status: 403 });

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({ tenantId: token.tenantId });
    const users = await User.find({ tenantId: token.tenantId })
      .select("-password")
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ 
      users, 
      total, 
      page, 
      pages: Math.ceil(total / limit) 
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 });
  }
}