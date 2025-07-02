import mongoose, { Schema, Document, Model } from "mongoose";

// --- Validation Regex Patterns ---
const holidayNameRegex = /^[A-Za-z ]+$/;

// --- Holiday Document Interface ---
export interface IHoliday extends Document {
  name: string;
  startDate: Date;
  endDate?: Date | null;
  isDateRange: boolean;
  type:
    | "National"
    | "Religious"
    | "Regional"
    | "Company"
    | "Optional"
    | "Festive"
    | "Observance"
    | "Compensatory"
    | "Other";
  createdAt: Date;
}

// --- Holiday Schema Definition ---
const HolidaySchema: Schema<IHoliday> = new Schema({
  name: {
    type: String,
    required: [true, "Holiday name is required"],
    trim: true,
    match: [
      holidayNameRegex,
      "Holiday name must contain only letters and spaces.",
    ],
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    default: null,
  },
  isDateRange: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    required: [true, "Holiday type is required"],
    enum: [
      "National",
      "Religious",
      "Regional",
      "Company",
      "Optional",
      "Festive",
      "Observance",
      "Compensatory",
      "Other",
    ],
    default: "Other",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// --- Holiday Model Export ---
export const HolidayModel: Model<IHoliday> =
  mongoose.models.Holiday || mongoose.model<IHoliday>("Holiday", HolidaySchema);
