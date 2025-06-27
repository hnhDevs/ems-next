import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { UserModel } from '@/model/UserModel';
import bcrypt from 'bcryptjs';
import { UserSchema } from '@/schemas/UserSchema';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    // Parse and validate request body, omitting system-managed fields
    const body = await req.json();
    const parsed = UserSchema.omit({
      cumulativeOvertime: true,
      totalLeaves: true,
      usedLeaves: true,
      pendingLeaves: true,
      createdAt: true,
      deletedAt: true,
    }).parse(body);

    // Destructure validated user fields
    const {
      username,
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      role,
      department,
      position,
      selfieUrl
    } = parsed;

    // --- Check for Existing User ---
    const existingUser = await UserModel.findOne({
      $or: [
        { username },
        { email },
        { phoneNumber }
      ]
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with provided username, email, or phone number already exists.' },
        { status: 409 }
      );
    }

    // --- Password Hashing ---
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      username,
      firstName,
      lastName,
      phoneNumber,
      email,
      password: hashedPassword,
      role,
      department,
      position,
      selfieUrl
    });

    await newUser.save();
    // Respond with success message
    return NextResponse.json({ message: 'User registered successfully.' }, { status: 201 });
  } catch (error: unknown) {

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 