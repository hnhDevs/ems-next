import { NextRequest, NextResponse } from "next/server";
import { HolidayModel } from "@/model/HolidayModel";
import { HolidaySchema } from "@/schemas/HolidaySchema";
import { dbConnect } from "@/lib/dbConnect";
import { parseDates } from "@/lib/dateUtils";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    // Pagination logic
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const total = await HolidayModel.countDocuments();

    // Get paginated holidays
    const holidays = await HolidayModel.find()
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    const parsed = holidays.map((holiday) => {
      // Convert to plain object and parse date fields
      const obj = holiday.toObject();
      const objWithDates = parseDates(
        obj as unknown as Record<string, unknown>,
        ["startDate", "endDate", "createdAt"]
      );
      // Validate using safeParse
      const result = HolidaySchema.safeParse(objWithDates);
      if (!result.success) {
        // If validation fails, return a minimal error object (could also throw or filter out)
        return { error: true, errors: result.error.errors, _id: obj._id };
      }
      return result.data;
    });

    // Type guard for error objects
    function isErrorHoliday(h: unknown): h is { error: true } {
      return typeof h === "object" && h !== null && "error" in h;
    }
    const invalid = parsed.filter(isErrorHoliday);
    if (invalid.length > 0) {
      return NextResponse.json(
        { success: false, message: "Some holidays failed validation", invalid },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsed,
      count: parsed.length,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalHolidays: total,
    });
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, message: errMsg },
      { status: 500 }
    );
  }
}
