import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/model/UserModel";
import { UserSchema } from "@/schemas/UserSchema";
import { signJwt } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    // Parse and validate request body (only email and password)
    const body = await req.json();
    const loginSchema = UserSchema.pick({
      email: true,
      password: true,
    });
    const parsed = loginSchema.parse(body);

    // Find user by email only
    const user = await UserModel.findOne({
      email: parsed.email,
    });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(parsed.password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Generate JWT token (omit password in payload)
    const userData = user.toObject();
    delete (userData as unknown as Record<string, unknown>)["password"];
    const token = signJwt({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ token, user: userData }, { status: 200 });
  } catch (error) {
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
