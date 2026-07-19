/**
 * AI-powered insight extraction using OpenAI function calling
 * Extracts structured data from unstructured text
 */

import { prisma } from "@/lib/prisma";

export interface ExtractedPainPoint {
  text: string;
  frequency?: number;
  severity?: "LOW" | "MEDIUM" | "HIGH";
}

export interface ExtractedQuote {
  text: string;
  context?: string;
}

export interface ExtractedFeatureRequest {
  text: string;
  justification?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
}

export interface ExtractedPersona {
  name: string;
  jobTitle?: string;
  goals?: string[];
  painPoints?: string[];
  behavior?: string;
  confidence?: number;
  segment?: string;
}

export interface ExtractedOpportunity {
  title: string;
  description: string;
  justification?: string;
  estimatedROI?: number;
  estimatedEffort?: string;
  priority?: number;
}

export interface ExtractedTheme {
  name: string;
  description?: string;
  frequency?: number;
  relatedKeywords?: string[];
}

export interface InsightData {
  painPoints: ExtractedPainPoint[];
  quotes: ExtractedQuote[];
  featureRequests: ExtractedFeatureRequest[];
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  themes: ExtractedTheme[];
  personas: ExtractedPersona[];
  opportunities: ExtractedOpportunity[];
}

/**
 * Call OpenAI to extract insights from text using function calling
 */
export async function extractInsightsFromText(
  text: string,
  _documentId?: string
): Promise<InsightData> {

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY not set");
    throw new Error("OpenAI API key not configured");
  }

  const systemPrompt = `You are an expert analyst specializing in extracting insights from customer feedback, research, and discovery documents. Extract structured data including:
- Pain points: Problems or frustrations mentioned
- Customer quotes: Direct quotes from customers or users
- Feature requests: Desired features or improvements
- Overall sentiment: Positive, Negative, or Neutral
- Themes: Common topics or categories
- Personas: User profiles or customer types with jobs, goals, and pain points
- Opportunities: Business opportunities based on the insights

Be thorough but focus on actionable items.`;

  const userPrompt = `Extract insights from the following text. Return structured JSON with all available insights:\n\n${text}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        functions: [
          {
            name: "extract_insights",
            description: "Extract structured insights from text",
            parameters: {
              type: "object",
              properties: {
                painPoints: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      frequency: { type: "number", minimum: 1, maximum: 10 },
                      severity: {
                        type: "string",
                        enum: ["LOW", "MEDIUM", "HIGH"],
                      },
                    },
                    required: ["text"],
                  },
                },
                quotes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      context: { type: "string" },
                    },
                    required: ["text"],
                  },
                },
                featureRequests: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      justification: { type: "string" },
                      priority: {
                        type: "string",
                        enum: ["LOW", "MEDIUM", "HIGH"],
                      },
                    },
                    required: ["text"],
                  },
                },
                sentiment: {
                  type: "string",
                  enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"],
                },
                themes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      frequency: { type: "number", minimum: 1 },
                      relatedKeywords: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: ["name"],
                  },
                },
                personas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      jobTitle: { type: "string" },
                      goals: {
                        type: "array",
                        items: { type: "string" },
                      },
                      painPoints: {
                        type: "array",
                        items: { type: "string" },
                      },
                      behavior: { type: "string" },
                      confidence: { type: "number", minimum: 0, maximum: 100 },
                      segment: { type: "string" },
                    },
                    required: ["name"],
                  },
                },
                opportunities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      justification: { type: "string" },
                      estimatedROI: { type: "number", minimum: 0, maximum: 100 },
                      estimatedEffort: { type: "string" },
                      priority: { type: "number", minimum: 1, maximum: 10 },
                    },
                    required: ["title", "description"],
                  },
                },
              },
              required: [
                "painPoints",
                "featureRequests",
                "sentiment",
                "themes",
                "personas",
                "opportunities",
              ],
            },
          },
        ],
        function_call: { name: "extract_insights" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const functionCall = data.choices[0]?.message?.function_call;

    if (!functionCall || functionCall.name !== "extract_insights") {
      throw new Error("Invalid response from OpenAI");
    }

    const insights: InsightData = JSON.parse(functionCall.arguments);
    return insights;
  } catch (error) {
    console.error("Error extracting insights:", error);
    // Return basic extraction if OpenAI fails
    return getBasicInsights(text);
  }
}

/**
 * Fallback: Basic insight extraction using regex and string analysis
 */
function getBasicInsights(text: string): InsightData {
  // Split into sentences and paragraphs
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];


  // Sentiment analysis
  const positiveWords =
    /great|excellent|perfect|amazing|wonderful|love|best|fantastic|good|happy|satisfied|impressed/gi;
  const negativeWords =
    /bad|poor|terrible|awful|hate|worst|disappointed|frustrating|broken|issue|problem|pain|struggle/gi;

  const positiveCount = (text.match(positiveWords) || []).length;
  const negativeCount = (text.match(negativeWords) || []).length;

  let sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" = "NEUTRAL";
  if (positiveCount > negativeCount) sentiment = "POSITIVE";
  else if (negativeCount > positiveCount) sentiment = "NEGATIVE";

  // Extract pain points (common complaint patterns)
  const painPoints: ExtractedPainPoint[] = [];
  const painPattern =
    /(?:problem|issue|struggle|difficulty|pain|frustrat|difficult|hard|challenge|can't|cannot)/gi;
  sentences.forEach((sentence) => {
    if (painPattern.test(sentence)) {
      painPoints.push({
        text: sentence.trim().slice(0, 200),
        severity: negativeCount > 3 ? "HIGH" : "MEDIUM",
        frequency: 1,
      });
    }
  });

  // Extract quotes (longer sentences)
  const quotes: ExtractedQuote[] = [];
  sentences
    .filter((s) => s.trim().length > 50)
    .slice(0, 3)
    .forEach((quote) => {
      quotes.push({ text: quote.trim().slice(0, 300) });
    });

  // Extract feature requests
  const featureRequests: ExtractedFeatureRequest[] = [];
  const featurePattern =
    /(?:should|could|want|need|wish|feature|add|implement|better|improve)/gi;
  sentences.forEach((sentence) => {
    if (featurePattern.test(sentence)) {
      featureRequests.push({
        text: sentence.trim().slice(0, 200),
        priority: "MEDIUM",
      });
    }
  });

  // Extract themes from key terms
  const themes: ExtractedTheme[] = [];
  const themeKeywords = [
    {
      name: "User Experience",
      keywords: ["experience|interface|usability|ui|ux|design"],
    },
    {
      name: "Performance",
      keywords: ["slow|fast|speed|performance|responsive|lag"],
    },
    { name: "Features", keywords: ["feature|functionality|capability|tool"] },
    { name: "Support", keywords: ["help|support|customer|service|team"] },
    {
      name: "Integration",
      keywords: ["integration|sync|connect|api|third-party"],
    },
  ];

  themeKeywords.forEach((theme) => {
    const pattern = new RegExp(theme.keywords[0], "gi");
    const matches = (text.match(pattern) || []).length;
    if (matches > 0) {
      themes.push({
        name: theme.name,
        frequency: matches,
      });
    }
  });

  // Create a basic persona from analysis
  const personas: ExtractedPersona[] = [
    {
      name: "Primary User",
      goals: ["Accomplish main objectives", "Solve key problems"],
      painPoints: painPoints.slice(0, 2).map((p) => p.text),
      confidence: 60,
    },
  ];

  // Extract opportunities (based on pain points and feature requests)
  const opportunities: ExtractedOpportunity[] = [];
  if (painPoints.length > 0) {
    opportunities.push({
      title: "Address Top Pain Points",
      description: `Solve the following issues: ${painPoints
        .slice(0, 2)
        .map((p) => p.text.slice(0, 50))
        .join(", ")}`,
      priority: 1,
      estimatedROI: 75,
    });
  }

  if (featureRequests.length > 0) {
    opportunities.push({
      title: "Implement Most Requested Features",
      description: `Users want: ${featureRequests
        .slice(0, 2)
        .map((f) => f.text.slice(0, 50))
        .join(", ")}`,
      priority: 2,
      estimatedROI: 65,
    });
  }

  return {
    painPoints,
    quotes,
    featureRequests,
    sentiment,
    themes,
    personas,
    opportunities,
  };
}

/**
 * Process extracted insights and save to database
 */
export async function saveInsightsToDatabase(
  projectId: string,
  documentId: string,
  insights: InsightData
): Promise<void> {
  try {
    // Save pain points as insights
    for (const painPoint of insights.painPoints) {
      await prisma.insight.create({
        data: {
          projectId,
          documentId,
          type: "PAIN_POINT",
          content: painPoint.text,
          severity: painPoint.severity || "MEDIUM",
          sentiment: insights.sentiment,
          confidence: 70,
          frequency: painPoint.frequency || 1,
        },
      });
    }

    // Save feature requests as insights
    for (const featureRequest of insights.featureRequests) {
      await prisma.insight.create({
        data: {
          projectId,
          documentId,
          type: "FEATURE_REQUEST",
          content: featureRequest.text,
          severity: featureRequest.priority || "MEDIUM",
          sentiment: "NEUTRAL",
          confidence: 65,
          frequency: 1,
        },
      });
    }

    // Save quotes as insights
    for (const quote of insights.quotes) {
      await prisma.insight.create({
        data: {
          projectId,
          documentId,
          type: "QUOTE",
          content: quote.text,
          sentiment: insights.sentiment,
          confidence: 80,
          frequency: 1,
        },
      });
    }

    // Save themes
    for (const theme of insights.themes) {
      // Check if theme already exists
      let existingTheme = await prisma.theme.findFirst({
        where: {
          projectId,
          name: theme.name,
        },
      });

      if (existingTheme) {
        // Update existing theme
        await prisma.theme.update({
          where: { id: existingTheme.id },
          data: {
            frequency: {
              increment: theme.frequency || 1,
            },
          },
        });
      } else {
        // Create new theme
        await prisma.theme.create({
          data: {
            projectId,
            name: theme.name,
            description: theme.description,
            frequency: theme.frequency || 1,
            trend: "increasing",
            impact: "medium",
          },
        });
      }
    }

    // Save personas
    for (const persona of insights.personas) {
      // Check if persona already exists
      let existingPersona = await prisma.persona.findFirst({
        where: {
          projectId,
          name: persona.name,
        },
      });

      if (existingPersona) {
        // Update existing persona
        await prisma.persona.update({
          where: { id: existingPersona.id },
          data: {
            role: persona.jobTitle || existingPersona.role,
            goals: JSON.stringify([
              ...new Set([
                ...JSON.parse(existingPersona.goals || "[]"),
                ...(persona.goals || []),
              ]),
            ]),
            painPoints: JSON.stringify([
              ...new Set([
                ...JSON.parse(existingPersona.painPoints || "[]"),
                ...(persona.painPoints || []),
              ]),
            ]),
            behavior: persona.behavior || existingPersona.behavior,
            documentCount: {
              increment: 1,
            },
            confidence: Math.min(
              100,
              existingPersona.confidence + (persona.confidence || 0)
            ) / 2,
          },
        });
      } else {
        // Create new persona
        await prisma.persona.create({
          data: {
            projectId,
            name: persona.name,
            role: persona.jobTitle,
            goals: JSON.stringify(persona.goals || []),
            painPoints: JSON.stringify(persona.painPoints || []),
            behavior: persona.behavior,
            confidence: persona.confidence || 60,
            segment: persona.segment,
            documentCount: 1,
          },
        });
      }
    }

    // Save opportunities
    for (const opportunity of insights.opportunities) {
      // Check if opportunity already exists
      let existingOpp = await prisma.opportunity.findFirst({
        where: {
          projectId,
          title: opportunity.title,
        },
      });

      if (existingOpp) {
        // Update existing opportunity
        await prisma.opportunity.update({
          where: { id: existingOpp.id },
          data: {
            frequency: {
              increment: 1,
            },
          },
        });
      } else {
        // Create new opportunity
        await prisma.opportunity.create({
          data: {
            projectId,
            title: opportunity.title,
            description: opportunity.description,
            score: opportunity.priority ? opportunity.priority * 10 : 50,
            roi: opportunity.estimatedROI || 50,
            businessValue: opportunity.justification,
            timeToImplement: opportunity.estimatedEffort,
            impactLevel:
              opportunity.priority && opportunity.priority > 6
                ? "high"
                : opportunity.priority && opportunity.priority > 3
                  ? "medium"
                  : "low",
            confidence: 70,
            frequency: 1,
          },
        });
      }
    }

    console.log(
      `Successfully saved insights from document ${documentId} to database`
    );
  } catch (error) {
    console.error("Error saving insights to database:", error);
    throw error;
  }
}
