import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { getUserFromRequest } from "@/lib/authMiddleware";
import { UserModel } from "@/model/UserModel";

export async function GET(req: NextRequest) {
  try {
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

    // Verify the user exists and check if they have admin privileges
    const currentUser = await UserModel.findById(userId).lean();
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has admin or master-admin role
    if (currentUser.role !== "admin" && currentUser.role !== "master-admin") {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    // --- Pagination logic ---
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const total = await UserModel.countDocuments({ deletedAt: null });

    // Get paginated users
    const users = await UserModel.find({ deletedAt: null })
      .select("-password -__v")
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform the data to match the expected format
    const formattedUsers = users.map((user) => ({
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
      cumulativeOvertime: user.cumulativeOvertime,
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      count: formattedUsers.length,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
