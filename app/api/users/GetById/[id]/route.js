// /app/api/users/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/Mongo/Connectdb';
import User from '@/modals/Users/User';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

// GET: Get a specific user by id
export async function GET(request, { params }) {
  await dbConnect();
  try {
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

