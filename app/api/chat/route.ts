import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.projectId || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: body.projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const mockResponses = [
      "Based on your research, the top opportunity is dark mode with a score of 92.",
      "Your user personas show that 65% of users are interested in API features.",
      "The most mentioned pain point is slow performance on mobile devices.",
      "Your themes indicate strong interest in integration capabilities.",
      "Consider prioritizing the top 3 opportunities for your next sprint.",
    ];

    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    const userMessage = await prisma.chatHistory.create({
      data: {
        projectId: body.projectId,
        userId,
        message: body.message,
        response: "",
      },
    });

    const assistantMessage = await prisma.chatHistory.create({
      data: {
        projectId: body.projectId,
        userId,
        message: `Assistant: ${response}`,
        response: response,
      },
    });

    return NextResponse.json({
      userMessage,
      assistantMessage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}