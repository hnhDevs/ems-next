import mongoose, { Schema, Document, Model } from "mongoose";

// --- Attendance Document Interface ---
export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  checkInTime: Date;
  checkOutTime?: Date | null;
  date: Date;
  status: "checked-in" | "checked-out" | "absent";
  totalHours: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// --- Attendance Schema Definition ---
const AttendanceSchema: Schema<IAttendance> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    index: true,
  },
  checkInTime: {
    type: Date,
    required: [true, "Check-in time is required"],
  },
  checkOutTime: {
    type: Date,
    default: null,
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
    index: true,
  },
  status: {
    type: String,
    enum: ["checked-in", "checked-out", "absent"],
    default: "checked-in",
  },
  totalHours: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

// Compound index for efficient queries
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Pre-save middleware to update the updatedAt field and calculate totalHours
AttendanceSchema.pre<IAttendance>("save", function (next) {
  this.updatedAt = new Date();
  if (this.checkInTime && this.checkOutTime) {
    const diffInMs = this.checkOutTime.getTime() - this.checkInTime.getTime();
    this.totalHours = Math.round((diffInMs / (1000 * 60 * 60)) * 100) / 100;
    this.status = "checked-out";
  }
  next();
});

// Instance method to check out
AttendanceSchema.methods.checkOut = function (checkOutTime: Date = new Date()) {
  this.checkOutTime = checkOutTime;
  this.status = "checked-out";
  return this.save();
};

// Static method to find attendance by user and date
AttendanceSchema.statics.findByUserAndDate = function (userId: mongoose.Types.ObjectId, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return this.findOne({
    userId: userId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    deletedAt: null,
  }).populate("userId", "firstName lastName email department position");
};

// Static method to get user attendance summary
AttendanceSchema.statics.getUserAttendanceSummary = function (
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        totalHours: { $sum: "$totalHours" },
        avgHours: { $avg: "$totalHours" },
        daysPresent: {
          $sum: {
            $cond: [{ $ne: ["$status", "absent"] }, 1, 0],
          },
        },
      },
    },
  ]);
};

// --- Attendance Model Export ---
export const AttendanceModel: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
