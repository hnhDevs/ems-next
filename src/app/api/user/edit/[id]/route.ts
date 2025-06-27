import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/model/UserModel";
import { UserSchema } from "@/schemas/UserSchema";
import { ZodError } from "zod";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: "Invalid user ID." },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    // Only allow fields relevant for update; omit system-managed fields
    if ("deletedAt" in body) delete body.deletedAt;

    // Validate at least one updatable field is present
    const updatableFields = [
      "username",
      "firstName",
      "lastName",
      "phoneNumber",
      "email",
      "password",
      "department",
      "position",
      "selfieUrl",
      "cumulativeOvertime",
      "totalLeaves",
      "usedLeaves",
      "pendingLeaves",
      "createdAt",
    ];
    const hasUpdatable = updatableFields.some((field) => field in body);
    if (!hasUpdatable) {
      return NextResponse.json(
        { error: "Please provide at least one field to update." },
        { status: 400 }
      );
    }

    // Validate fields using UserSchema (partial, omit deletedAt and role)
    const partialSchema = UserSchema.omit({ deletedAt: true, role: true }).partial();
    const parsed = partialSchema.parse(body);

    // Check if user with same email, phone, or username exists
    const uniqueQuery: Record<string, unknown> = { _id: { $ne: id } };
    if (parsed.email) uniqueQuery.email = parsed.email;
    if (parsed.phoneNumber) uniqueQuery.phoneNumber = parsed.phoneNumber;
    if (parsed.username) uniqueQuery.username = parsed.username;
    if (parsed.email || parsed.phoneNumber || parsed.username) {
      const existingUser = await UserModel.findOne(uniqueQuery);
      if (existingUser) {
        return NextResponse.json(
          { error: "Email, phone number, or username is already in use by another user." },
          { status: 409 }
        );
      }
    }

    // Hash the password if being updated
    if (parsed.password) {
      const bcrypt = await import("bcryptjs");
      parsed.password = await bcrypt.hash(parsed.password, 10);
    }

    // Update user
    const updatedUser = await UserModel.findByIdAndUpdate(id, parsed, { new: true });
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found. Please check the user ID." },
        { status: 404 }
      );
    }

    // Prepare response data (omit password)
    const {
      _id,
      username,
      firstName,
      lastName,
      email,
      phoneNumber,
      department,
      position,
      selfieUrl,
      cumulativeOvertime,
      totalLeaves,
      usedLeaves,
      pendingLeaves,
      createdAt,
    } = updatedUser;

    return NextResponse.json({
      message: "User information updated successfully.",
      data: {
        id: _id,
        username,
        firstName,
        lastName,
        email,
        phoneNumber,
        department,
        position,
        selfieUrl,
        cumulativeOvertime,
        totalLeaves,
        usedLeaves,
        pendingLeaves,
        createdAt,
      },
    });
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    let errorMessage = "Unable to update user information. Please try again later.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
