import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retrieveProjectContext, generateSystemPrompt } from "@/lib/rag-service";

/**
 * GET /api/chat
 * Retrieve chat history for a project
 * Query params:
 *   - projectId: Required - filter by project
 *   - limit: Number of messages to retrieve (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Fetch chat messages
    const messages = await prisma.chatMessage.findMany({
      where: { projectId, userId },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("GET chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat
 * Send a message and get AI response
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, message } = body;

    if (!projectId || !message) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, message" },
        { status: 400 }
      );
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        projectId,
        userId,
        role: "USER",
        content: message,
      },
    });

    // Retrieve project context for RAG
    let context;
    try {
      context = await retrieveProjectContext(projectId, message);
    } catch (error) {
      console.error("Error retrieving context:", error);
      context = {
        insights: [],
        themes: [],
        personas: [],
        opportunities: [],
      };
    }

    // Generate response using OpenAI
    let assistantContent: string;

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        assistantContent = await generateAIResponse(
          project.name,
          message,
          context,
          apiKey,
          projectId,
          userId
        );
      } catch (error: any) {
        console.error("Error calling OpenAI:", error);
        assistantContent = generateFallbackResponse(message, context);
      }
    } else {
      assistantContent = generateFallbackResponse(message, context);
    }

    // Save assistant message
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        projectId,
        userId,
        role: "ASSISTANT",
        content: assistantContent,
      },
    });

    return NextResponse.json(
      {
        userMessage,
        assistantMessage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat message" },
      { status: 500 }
    );
  }
}

/**
 * Generate AI response using OpenAI with RAG context
 */
async function generateAIResponse(
  projectName: string,
  userMessage: string,
  context: any,
  apiKey: string,
  projectId: string,
  userId: string
): Promise<string> {
  // Retrieve recent chat history for context
  const recentMessages = await prisma.chatMessage.findMany({
    where: { projectId, userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      role: true,
      content: true,
    },
  });

  // Reverse to get chronological order
  const chatHistory = recentMessages.reverse();

  // Generate system prompt with project context
  const systemPrompt = generateSystemPrompt(projectName, context);

  // Build messages array for OpenAI
  const messages: any[] = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  // Add chat history (limit to prevent token overflow)
  chatHistory.slice(0, 8).forEach((msg) => {
    messages.push({
      role: msg.role === "USER" ? "user" : "assistant",
      content: msg.content,
    });
  });

  // Add current user message (if not already in history)
  messages.push({
    role: "user",
    content: userMessage,
  });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(errorData.error?.message || "OpenAI API error");
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("No response from OpenAI");
    }

    return assistantMessage;
  } catch (error: any) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}

/**
 * Generate fallback response when OpenAI is unavailable
 */
function generateFallbackResponse(message: string, context: any): string {
  const queryLower = message.toLowerCase();

  // Check what the user is asking about
  if (
    queryLower.includes("pain") ||
    queryLower.includes("problem") ||
    queryLower.includes("issue")
  ) {
    if (context.insights?.length > 0) {
      const painPoints = context.insights.filter((i: any) => i.type === "PAIN_POINT");
      if (painPoints.length > 0) {
        return `Based on your research, here are the top pain points:\n\n${painPoints
          .slice(0, 3)
          .map(
            (p: any) =>
              `• ${p.content} (${p.confidence}% confidence, mentioned ${p.frequency} times)`
          )
          .join("\n")}\n\nThese are the most critical issues affecting your customers.`;
      }
    }
    return "I don't have enough data on pain points yet. Please upload customer feedback documents to get started.";
  }

  if (
    queryLower.includes("opportunity") ||
    queryLower.includes("potential") ||
    queryLower.includes("growth")
  ) {
    if (context.opportunities?.length > 0) {
      return `Here are your top opportunities:\n\n${context.opportunities
        .slice(0, 3)
        .map(
          (o: any) =>
            `• ${o.title} (Score: ${o.score}, ROI: ${o.roi}%)\n  ${o.description}`
        )
        .join("\n\n")}\n\nThese represent the highest-potential areas for growth.`;
    }
    return "No opportunities identified yet. Upload more research data to identify growth opportunities.";
  }

  if (
    queryLower.includes("persona") ||
    queryLower.includes("user") ||
    queryLower.includes("customer")
  ) {
    if (context.personas?.length > 0) {
      return `Your identified personas:\n\n${context.personas
        .map((p: any) => `• ${p.name}${p.role ? ` (${p.role})` : ""} - ${p.confidence}% confidence`)
        .join("\n")}\n\nThese personas represent distinct user segments in your market.`;
    }
    return "No personas generated yet. Upload customer research to generate user personas.";
  }

  if (queryLower.includes("theme") || queryLower.includes("topic")) {
    if (context.themes?.length > 0) {
      return `Key themes identified:\n\n${context.themes
        .slice(0, 5)
        .map(
          (t: any) =>
            `• ${t.name}${t.description ? ` - ${t.description}` : ""} (${t.frequency} mentions)`
        )
        .join("\n")}\n\nThese themes represent the main topics in your research.`;
    }
    return "No themes identified yet. Upload research documents to identify key themes.";
  }

  if (queryLower.includes("summary") || queryLower.includes("overview")) {
    const stats = {
      insights: context.insights?.length || 0,
      themes: context.themes?.length || 0,
      personas: context.personas?.length || 0,
      opportunities: context.opportunities?.length || 0,
    };

    return `Research Summary:\n• Insights: ${stats.insights}\n• Themes: ${stats.themes}\n• Personas: ${stats.personas}\n• Opportunities: ${stats.opportunities}\n\nYou have a solid foundation of data to work with!`;
  }

  // Default response
  return `I can help you analyze your research data. Ask me about:\n• Pain points and issues customers face\n• Growth opportunities\n• User personas\n• Key themes in the research\n• Recommendations for next steps\n\nWhat would you like to know?`;
}

