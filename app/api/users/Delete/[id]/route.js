import { NextResponse } from 'next/server';
import dbConnect from '@/lib/Mongo/Connectdb';
import User from '@/modals/Users/User';
import { getToken } from 'next-auth/jwt';
import { rateLimit } from '@/lib/rate-limit';

export async function DELETE(req, { params }) {
  await dbConnect();
  const { success } = await rateLimit(req, { max: 100, windowMs: 15 * 60 * 1000 });
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const deletedUser = await User.findOneAndDelete({ _id: params.id, tenantId: token.tenantId });
    if (!deletedUser) return NextResponse.json({ error: "User not found", code: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 });
  }
}