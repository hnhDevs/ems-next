import mongoose from "mongoose";

// --- Connection Object Interface ---
type ConnectionObject = {
  isConnected?: number;
};

// --- Singleton Connection State ---
const connection: ConnectionObject = {};

// --- Database Connection Utility ---
export async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to DB!");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "");
    connection.isConnected = db.connections[0].readyState;
    console.log("✓ Connected to MongoDB successfully");
  } catch (error) {
    console.error("✗ MongoDB connection error:", error);
    process.exit(1);
  }
}
