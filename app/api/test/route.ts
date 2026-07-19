import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing project query...");
    const projects = await prisma.project.findMany({
      where: { userId: "some-user-id" }
    });
    return NextResponse.json({ success: true, count: projects.length });
  } catch (error: any) {
    console.error("Project query test error:", error);
    return NextResponse.json({
      success: false,
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    }, { status: 500 });
  }
}
