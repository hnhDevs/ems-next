import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/model/UserModel";
import mongoose from "mongoose";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
  }

  try {
    // Hard delete: remove user from DB
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json(
        { error: "User not found. Please check the user ID." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      message: "User deleted successfully.",
      data: { id: deletedUser._id },
    });
  } catch (error: unknown) {
    let errorMessage = "Unable to delete user. Please try again later.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
