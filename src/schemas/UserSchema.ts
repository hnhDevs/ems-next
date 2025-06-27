import { z } from "zod";

// --- Validation Regex Patterns ---
const usernameRegex = /^[a-z0-9@#$!_\-]+$/;
const nameRegex = /^[A-Za-z]+$/;
const indianPhoneRegex = /^(\+91)?[6-9][0-9]{9}$/;
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@#$&]).{6,}$/;

// --- User Zod Schema ---
export const UserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(usernameRegex, {
      message:
        "Username must be lowercase, can contain letters, numbers, and @,#,$,_,-,!, and must be unique.",
    })
    .toLowerCase(), // Uniqueness enforced at DB/model level
  firstName: z
    .string()
    .min(3)
    .max(30)
    .regex(nameRegex, { message: "First name must contain only letters." })
    .trim(),
  lastName: z
    .string()
    .min(3)
    .max(30)
    .regex(nameRegex, { message: "Last name must contain only letters." })
    .trim(),
  // Uniqueness for phoneNumber should be enforced at the DB/model level
  phoneNumber: z
    .string()
    .regex(indianPhoneRegex, {
      message: "Phone number must be a valid Indian phone number.",
    }),
  // Uniqueness for email should be enforced at the DB/model level
  email: z.string().email(),
  password: z
    .string()
    .min(6)
    .regex(passwordRegex, {
      message:
        "Password must be at least 6 characters, contain letters, numbers, and one of @,#,$,&.",
    }),
  role: z.enum(["user", "admin", "master-admin"]).default("user"),
  department: z.string().default("Engineering"),
  position: z.string().default("Software Developer"),
  selfieUrl: z.string().nullable().default(null),
  cumulativeOvertime: z.number(), // can be positive, negative, or 0
  totalLeaves: z.number().nonnegative().default(18),
  usedLeaves: z.number().nonnegative().default(0),
  pendingLeaves: z.number().nonnegative().default(0),
  createdAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable().default(() => new Date()),
});

export type UserType = z.infer<typeof UserSchema>;
