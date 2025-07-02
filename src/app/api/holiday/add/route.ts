import { NextRequest, NextResponse } from "next/server";
import { HolidayModel } from "@/model/HolidayModel";
import { HolidaySchema } from "@/schemas/HolidaySchema";
import { dbConnect } from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    // Parse date strings to Date objects
    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.endDate) body.endDate = new Date(body.endDate);

    // Validate request body
    const parsed = HolidaySchema.safeParse(body);
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

    // Create new holiday
    const holiday = await HolidayModel.create(parsed.data);
    return NextResponse.json(
      {
        success: true,
        message: "Holiday added successfully",
        holiday,
      },
      { status: 201 }
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
