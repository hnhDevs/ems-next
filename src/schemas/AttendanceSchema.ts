import { z } from "zod";

export const AttendanceSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  checkInTime: z.date({ required_error: "Check-in time is required" }),
  checkOutTime: z.date().nullable().default(null),
  date: z.date({ required_error: "Date is required" }),
  status: z.enum(["checked-in", "checked-out", "absent"]).default("checked-in"),
  totalHours: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable().default(null),
});

export type AttendanceType = z.infer<typeof AttendanceSchema>;
