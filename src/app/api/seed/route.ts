import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const usersToInsert = [
      {
        email: "staff@library.com",
        name: "Library Staff",
        password: hashedPassword,
        role: "STAFF"
      },
      {
        email: "staff2@library.com",
        name: "Staff Member 2",
        password: hashedPassword,
        role: "STAFF"
      },
      {
        email: "librarian@library.com",
        name: "Head Librarian",
        password: hashedPassword,
        role: "LIBRARIAN"
      },
      {
        email: "display@library.com",
        name: "Display Screen",
        password: hashedPassword,
        role: "DISPLAY"
      }
    ];

    await prisma.user.deleteMany({});
    
    // createMany might throw P2031 still, use simple loop
    for (const u of usersToInsert) {
      await prisma.user.create({ data: u });
    }

    return NextResponse.json({ success: true, message: "Seeded via NextJS context!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
