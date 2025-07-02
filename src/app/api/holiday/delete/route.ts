import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { HolidayModel } from "@/model/HolidayModel";
import mongoose from "mongoose";

export async function DELETE(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid holiday ID." }, { status: 400 });
  }

  try {
    const deletedHoliday = await HolidayModel.findByIdAndDelete(id);
    if (!deletedHoliday) {
      return NextResponse.json(
        { error: "Holiday not found. Please check the holiday ID." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      message: "Holiday deleted successfully.",
      data: { id: deletedHoliday._id, name: deletedHoliday.name },
    });
  } catch (error: unknown) {
    let errorMessage = "Unable to delete holiday. Please try again later.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
