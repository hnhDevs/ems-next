import { NextRequest, NextResponse } from "next/server";
import { HolidayModel } from "@/model/HolidayModel";
import { HolidaySchema } from "@/schemas/HolidaySchema";
import { dbConnect } from "@/lib/dbConnect";
import { parseDates } from "@/lib/dateUtils";

// Create an update schema that omits 'createdAt'
const HolidayUpdateSchema = HolidaySchema._def.schema.omit({ createdAt: true });

export async function PATCH(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Holiday ID is required",
        },
        { status: 400 }
      );
    }

    // Parse date strings to Date objects using utility
    const parsedUpdateData = parseDates(updateData, ["startDate", "endDate"]);

    // Validate update data (ignore createdAt)
    const parsed = HolidayUpdateSchema.safeParse(parsedUpdateData);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.errors,
        },
        { status: 400 }
      );
    }

    const updatedHoliday = await HolidayModel.findByIdAndUpdate(
      id,
      parsed.data,
      { new: true }
    );

    if (!updatedHoliday) {
      return NextResponse.json(
        {
          success: false,
          message: "Holiday not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Holiday updated successfully",
        holiday: updatedHoliday,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        message: errMsg,
      },
      { status: 500 }
    );
  }
}
