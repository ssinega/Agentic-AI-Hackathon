/**
 * RAG (Retrieval-Augmented Generation) Service
 * Retrieves relevant project context for AI chat
 */

import { prisma } from "@/lib/prisma";

export interface ProjectContext {
  insights: Array<{
    id: string;
    type: string;
    content: string;
    severity?: string;
    confidence: number;
    frequency: number;
  }>;
  themes: Array<{
    id: string;
    name: string;
    description?: string;
    frequency: number;
    impact?: string;
  }>;
  personas: Array<{
    id: string;
    name: string;
    role?: string;
    confidence: number;
  }>;
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
    roi: number;
  }>;
}

/**
 * Retrieve relevant project context for a user query using semantic search
 */
export async function retrieveProjectContext(
  projectId: string,
  query: string,
  limit: number = 10
): Promise<ProjectContext> {
  try {
    // Convert query to lowercase for keyword matching
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/).filter((t) => t.length > 2);

    // Fetch insights matching query
    const insights = await prisma.insight.findMany({
      where: {
        projectId,
        OR: [
          { content: { contains: query } },
          { type: { contains: queryTokens[0] || "" } },
        ],
      },
      select: {
        id: true,
        type: true,
        content: true,
        severity: true,
        confidence: true,
        frequency: true,
      },
      orderBy: [{ frequency: "desc" }, { confidence: "desc" }],
      take: Math.ceil(limit * 0.4),
    });

    // Fetch themes matching query
    const themes = await prisma.theme.findMany({
      where: {
        projectId,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        frequency: true,
        impact: true,
      },
      orderBy: { frequency: "desc" },
      take: Math.ceil(limit * 0.2),
    });

    // Fetch personas matching query
    const personas = await prisma.persona.findMany({
      where: {
        projectId,
        OR: [
          { name: { contains: query } },
          { role: { contains: query } },
          { description: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        role: true,
        confidence: true,
      },
      orderBy: { confidence: "desc" },
      take: Math.ceil(limit * 0.2),
    });

    // Fetch opportunities matching query
    const opportunities = await prisma.opportunity.findMany({
      where: {
        projectId,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        score: true,
        roi: true,
      },
      orderBy: { score: "desc" },
      take: Math.ceil(limit * 0.2),
    });

    // If no results found, get top items by relevance
    if (
      insights.length === 0 &&
      themes.length === 0 &&
      personas.length === 0 &&
      opportunities.length === 0
    ) {
      const topInsights = await prisma.insight.findMany({
        where: { projectId },
        select: {
          id: true,
          type: true,
          content: true,
          severity: true,
          confidence: true,
          frequency: true,
        },
        orderBy: [{ frequency: "desc" }, { confidence: "desc" }],
        take: 5,
      });

      const topThemes = await prisma.theme.findMany({
        where: { projectId },
        select: {
          id: true,
          name: true,
          description: true,
          frequency: true,
          impact: true,
        },
        orderBy: { frequency: "desc" },
        take: 3,
      });

      const topOpportunities = await prisma.opportunity.findMany({
        where: { projectId },
        select: {
          id: true,
          title: true,
          description: true,
          score: true,
          roi: true,
        },
        orderBy: { score: "desc" },
        take: 2,
      });

      return {
        insights: topInsights,
        themes: topThemes.map(t => ({ ...t, description: t.description || undefined, impact: t.impact || undefined })),
        personas: [],
        opportunities: topOpportunities,
      };
    }

    return {
      insights,
      themes,
      personas,
      opportunities,
    };
  } catch (error) {
    console.error("Error retrieving project context:", error);
    throw error;
  }
}

/**
 * Format project context into a readable string for AI context
 */
export function formatProjectContextForAI(context: ProjectContext): string {
  const sections: string[] = [];

  // Add insights context
  if (context.insights.length > 0) {
    sections.push("CUSTOMER INSIGHTS:");
    context.insights.forEach((insight, idx) => {
      sections.push(
        `${idx + 1}. [${insight.type}] ${insight.content} (Confidence: ${insight.confidence}%, Mentioned: ${insight.frequency}x)`
      );
    });
  }

  // Add themes context
  if (context.themes.length > 0) {
    sections.push("\nKEY THEMES:");
    context.themes.forEach((theme, idx) => {
      sections.push(`${idx + 1}. ${theme.name} - ${theme.description || "N/A"} (Frequency: ${theme.frequency})`);
    });
  }

  // Add personas context
  if (context.personas.length > 0) {
    sections.push("\nUSER PERSONAS:");
    context.personas.forEach((persona, idx) => {
      sections.push(`${idx + 1}. ${persona.name}${persona.role ? ` (${persona.role})` : ""} (Confidence: ${persona.confidence}%)`);
    });
  }

  // Add opportunities context
  if (context.opportunities.length > 0) {
    sections.push("\nBUSINESS OPPORTUNITIES:");
    context.opportunities.forEach((opp, idx) => {
      sections.push(
        `${idx + 1}. ${opp.title} - ${opp.description} (Score: ${opp.score}, ROI: ${opp.roi}%)`
      );
    });
  }

  return sections.join("\n");
}

/**
 * Generate a system prompt for AI with project context
 */
export function generateSystemPrompt(projectName: string, context: ProjectContext): string {
  const contextString = formatProjectContextForAI(context);

  return `You are an expert analyst helping with the "${projectName}" project. You have access to the following research data and insights:

${contextString}

Your role is to:
1. Answer questions about the project's customer insights, themes, personas, and opportunities
2. Provide data-driven recommendations based on the research
3. Identify patterns and connections between different insights
4. Suggest actionable next steps based on the data
5. Help prioritize opportunities and address pain points

Be conversational, insightful, and always reference the specific data when making recommendations. If the user asks about something not covered in the data, acknowledge it and suggest related insights that might be helpful.`;
}
