import { z } from "zod";

// --- Validation Regex Patterns ---
const holidayNameRegex = /^[A-Za-z ]+$/;

// --- Holiday Zod Schema ---
export const HolidaySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Holiday name is required" })
    .regex(holidayNameRegex, { message: "Holiday name must contain only letters and spaces." })
    .trim(),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().nullable().default(null),
  isDateRange: z.boolean().default(false),
  type: z.enum([
    "National",
    "Religious",
    "Regional",
    "Company",
    "Optional",
    "Festive",
    "Observance",
    "Compensatory",
    "Other"
  ]).default("Other"),
  createdAt: z.date().default(() => new Date()),
});

export type HolidayType = z.infer<typeof HolidaySchema>;
