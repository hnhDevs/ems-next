import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { getUserFromRequest } from "@/lib/authMiddleware";
import { UserModel } from "@/model/UserModel";

export async function GET(req: NextRequest) {
  await dbConnect();

  // Extract and verify the JWT from the request headers
  const userPayload = getUserFromRequest(req);

  // Extract the user ID from the decoded JWT payload
  let userId: string | undefined;
  if (userPayload && typeof userPayload === "object" && "id" in userPayload) {
    userId = userPayload.id as string;
  }
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await UserModel.findById(userId).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Return the user's profile data in the specified format
  return NextResponse.json({
    id: user._id,
    name: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phoneNumber,
    selfieUrl: user.selfieUrl,
    department: user.department,
    position: user.position,
    joinDate: user.createdAt,
    role: user.role,
    totalLeaves: user.totalLeaves,
    usedLeaves: user.usedLeaves,
    pendingLeaves: user.pendingLeaves,
  });
}
