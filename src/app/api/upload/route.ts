import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getDb, ObjectId } from "@/lib/mongodb";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (user.role !== "STAFF" && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only staff can upload media" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const eventName = formData.get("eventName") as string | null;
    const eventDate = formData.get("eventDate") as string | null;

    if (!file || !title) {
      return NextResponse.json(
        { success: false, error: "File and title are required" },
        { status: 400 }
      );
    }

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { success: false, error: "Only image and video files are allowed" },
        { status: 400 }
      );
    }

    // 1 GB limit
    if (file.size > 1024 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size must be under 1GB" },
        { status: 400 }
      );
    }

    // Generate a unique filename for when the college storage server is integrated
    const uniqueId = crypto.randomUUID();
    const extension = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
    const filename = `${uniqueId}.${extension}`;

    // Simulated URL — will be replaced with the college storage server URL later
    const simulatedUrl = `/media/${filename}`;

    // Save metadata to MongoDB (no file written to disk yet)
    const db = await getDb();

    const newMediaDoc = {
      title,
      description: description || null,
      type: isVideo ? "VIDEO" : "PHOTO",
      url: simulatedUrl,
      thumbnailUrl: null,
      publicId: filename,           // will become the file identifier on the storage server
      status: "PENDING",
      eventName: eventName || null,
      eventDate: eventDate || null,
      fileSize: file.size,
      duration: null,               // video duration — to be populated by storage server later
      originalFilename: file.name,
      mimeType: file.type,
      userId: user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await db.collection("media").insertOne(newMediaDoc);

    const uploader = await db
      .collection("users")
      .findOne({ _id: new ObjectId(user.userId) });

    const media = {
      ...newMediaDoc,
      id: insertResult.insertedId.toString(),
      _id: undefined,
      uploadedBy: uploader
        ? { id: uploader._id.toString(), name: uploader.name, email: uploader.email }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: media,
      message: "Media uploaded successfully. Waiting for librarian approval.",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload media",
      },
      { status: 500 }
    );
  }
}
