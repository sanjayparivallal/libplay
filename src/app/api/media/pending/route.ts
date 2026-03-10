import { NextRequest, NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/mongodb";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/media/pending - Get pending media (librarian only)
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (user.role !== "LIBRARIAN" && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const db = await getDb();
    const mediaCollection = db.collection("media");

    const [rawMedia, total] = await Promise.all([
      mediaCollection
        .find({ status: "PENDING" })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      mediaCollection.countDocuments({ status: "PENDING" }),
    ]);

    const userIds = Array.from(new Set(rawMedia.map((m) => m.userId as string)));
    const users = await db
      .collection("users")
      .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
      .toArray();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userMap = users.reduce((acc: Record<string, any>, u) => {
      acc[u._id.toString()] = { id: u._id.toString(), name: u.name, email: u.email };
      return acc;
    }, {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const media = rawMedia.map((m: any) => ({
      ...m,
      id: m._id.toString(),
      _id: undefined,
      uploadedBy: userMap[m.userId as string] || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        media,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get pending media error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pending media" },
      { status: 500 }
    );
  }
}
