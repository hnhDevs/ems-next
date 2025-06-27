import mongoose, { Schema, Document, Model } from "mongoose";

// --- Leave Document Interface ---
export interface ILeave extends Document {
  user: mongoose.Types.ObjectId;
  leaveType:
    | "Annual"
    | "Sick"
    | "Maternity"
    | "Paternity"
    | "Unpaid"
    | "Casual"
    | "Compensatory"
    | "Bereavement"
    | "Marriage"
    | "Study"
    | "Sabbatical"
    | "Other";
  fromDate: Date;
  toDate: Date;
  reason: string;
  document?: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: Date;
}

// --- Leave Schema Definition ---
const LeaveSchema: Schema<ILeave> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  leaveType: {
    type: String,
    required: true,
    enum: [
      "Annual",
      "Sick",
      "Maternity",
      "Paternity",
      "Unpaid",
      "Casual",
      "Compensatory",
      "Bereavement",
      "Marriage",
      "Study",
      "Sabbatical",
      "Other"
    ],
  },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  reason: { type: String, required: true },
  document: { type: String, required: false },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

// --- Leave Model Export ---
export const LeaveModel: Model<ILeave> =
  mongoose.models.Leave || mongoose.model<ILeave>("Leave", LeaveSchema);
