import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || (user.role !== "LIBRARIAN" && user.role !== "STAFF")) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDb();
        const mediaCollection = db.collection("media");

        const matchStage = user.role === "STAFF"
            ? { $match: { userId: user.userId } }
            : { $match: {} };

        const stats = await mediaCollection.aggregate([
            matchStage,
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]).toArray();

        const counts = {
            pending: 0,
            approved: 0,
            rejected: 0
        };

        stats.forEach(stat => {
            if (stat._id === "PENDING") counts.pending = stat.count;
            else if (stat._id === "APPROVED") counts.approved = stat.count;
            else if (stat._id === "REJECTED") counts.rejected = stat.count;
        });

        return NextResponse.json({ success: true, data: counts });
    } catch (error) {
        console.error("Get media stats error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
