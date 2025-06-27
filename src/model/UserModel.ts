import mongoose, { Schema, Document, Model } from "mongoose";

// --- Validation Regex Patterns ---
const usernameRegex = /^[a-z0-9@#$!_\-]+$/;
const nameRegex = /^[A-Za-z]+$/;
const indianPhoneRegex = /^(\+91)?[6-9][0-9]{9}$/;
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@#$&]).{6,}$/;

// --- User Document Interface ---
export interface IUser extends Document {
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: string;
  department: string;
  position: string;
  selfieUrl: string;
  cumulativeOvertime: number;
  totalLeaves: number;
  usedLeaves: number;
  pendingLeaves: number;
  createdAt: Date;
  deletedAt?: Date;
}

// --- User Schema Definition ---
const UserSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [usernameRegex, "Username must be lowercase, can contain letters, numbers, and @,#,$,_,-,!"]
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [nameRegex, "First name must contain only letters."]
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [nameRegex, "Last name must contain only letters."]
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: [indianPhoneRegex, "Phone number must be a valid Indian phone number."]
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [emailRegex, "Email must be a valid email address."]
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    match: [passwordRegex, "Password must be at least 6 characters, contain letters, numbers, and one of @,#,$,&."]
  },
  role: {
    type: String,
    enum: ["user", "admin", "master-admin"],
    default: "user",
  },
  department: {
    type: String,
    default: "Engineering",
  },
  position: {
    type: String,
    default: "Software Developer",
  },
  selfieUrl: {
    type: String,
    default: null,
  },
  cumulativeOvertime: {
    type: Number,
    default: 0,
  },
  totalLeaves: {
    type: Number,
    default: 18,
  },
  usedLeaves: {
    type: Number,
    default: 0,
  },
  pendingLeaves: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

// --- User Model Export ---
export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
