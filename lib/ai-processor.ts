import { Insight, Theme, Persona, Opportunity } from "@/types";

/**
 * Cluster insights into themes based on similarity
 */
export function clusterInsightsIntoThemes(insights: Insight[]): Theme[] {
  const themes: Map<string, Theme> = new Map();

  insights.forEach((insight) => {
    // Simple clustering by extracting key terms
    const keyTerms = extractKeyTerms(insight.content);
    const themeKey = keyTerms[0] || "general";

    if (themes.has(themeKey)) {
      const theme = themes.get(themeKey)!;
      theme.frequency += 1;
      theme.relatedInsights.push(insight.id);
    } else {
      themes.set(themeKey, {
        id: `theme-${Math.random().toString(36).substr(2, 9)}`,
        projectId: insight.projectId,
        name: formatThemeName(themeKey),
        frequency: 1,
        relatedInsights: [insight.id],
        createdAt: new Date(),
      });
    }
  });

  return Array.from(themes.values()).sort((a, b) => b.frequency - a.frequency);
}

/**
 * Generate personas from insights and themes (legacy - not used in production)
 */
export function clusterPersonasFromInsights(
  insights: Insight[],
  themes: Theme[],
  projectId: string
): Persona[] {
  const personas: Persona[] = [];

  // Create primary persona
  if (insights.length > 0) {
    personas.push({
      id: `persona-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      type: "primary",
      name: "Primary User",
      description: "Main user derived from most frequent insights",
      frustrations: extractCommonFrustrations(insights),
      goals: extractCommonGoals(insights),
      size: calculatePersonaSize(insights.length),
      createdAt: new Date(),
    });
  }

  // Create secondary personas if we have enough diversity
  if (themes.length > 1) {
    themes.slice(0, 2).forEach((theme) => {
      personas.push({
        id: `persona-${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        type: "secondary",
        name: `${theme.name} User`,
        description: `User focused on ${theme.name}`,
        frustrations: theme.description,
        size: calculatePersonaSize(theme.frequency),
        createdAt: new Date(),
      });
    });
  }

  return personas;
}

/**
 * Rank opportunities based on multiple factors
 */
export function rankOpportunities(insights: Insight[], projectId: string): Opportunity[] {
  const opportunitiesMap: Map<string, Opportunity> = new Map();

  insights.forEach((insight) => {
    if (insight.type === "feature_request" || insight.type === "pain_point") {
      const key = insight.content.substring(0, 50);

      if (opportunitiesMap.has(key)) {
        const opp = opportunitiesMap.get(key)!;
        opp.frequency += 1;
        opp.score = calculateOpportunityScore(opp);
      } else {
        const opportunity: Opportunity = {
          id: `opp-${Math.random().toString(36).substr(2, 9)}`,
          projectId,
          title: truncateTitle(insight.content, 50),
          description: insight.content,
          frequency: 1,
          severity: calculateSeverity(insight.frequency, insight.confidence),
          confidence: insight.confidence,
          score: calculateOpportunityScore({} as Opportunity),
          createdAt: new Date(),
        };
        opportunitiesMap.set(key, opportunity);
      }
    }
  });

  const opportunities = Array.from(opportunitiesMap.values());

  // Sort by score and assign rankings
  opportunities.sort((a, b) => b.score - a.score);
  opportunities.forEach((opp, index) => {
    opp.ranking = index + 1;
  });

  return opportunities;
}

/**
 * Calculate opportunity score based on multiple factors
 */
export function calculateOpportunityScore(opportunity: Opportunity): number {
  let score = 0;

  // Frequency factor (0-40 points)
  score += Math.min(opportunity.frequency * 4, 40);

  // Confidence factor (0-30 points)
  score += opportunity.confidence * 30;

  // Severity factor (0-30 points)
  const severityMap = { high: 30, medium: 15, low: 5 };
  score += severityMap[opportunity.severity as keyof typeof severityMap] || 0;

  return Math.round(score);
}

/**
 * Extract key terms from text
 */
function extractKeyTerms(text: string): string[] {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
  ]);

  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => !stopWords.has(word) && word.length > 3)
    .slice(0, 3);
}

/**
 * Format theme name
 */
function formatThemeName(term: string): string {
  return term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();
}

/**
 * Extract common frustrations from insights
 */
function extractCommonFrustrations(insights: Insight[]): string {
  const frustrations = insights
    .filter((i) => i.type === "pain_point")
    .map((i) => i.content)
    .slice(0, 3);

  return frustrations.join("; ") || "Various challenges identified";
}

/**
 * Extract common goals from insights
 */
function extractCommonGoals(insights: Insight[]): string {
  const goals = insights
    .filter((i) => i.type === "customer_need" || i.type === "feature_request")
    .map((i) => i.content)
    .slice(0, 3);

  return goals.join("; ") || "Success through product improvement";
}

/**
 * Calculate persona size based on frequency
 */
function calculatePersonaSize(frequency: number): string {
  if (frequency > 20) return "large";
  if (frequency > 5) return "medium";
  return "small";
}

/**
 * Calculate severity based on frequency and confidence
 */
function calculateSeverity(frequency: number, confidence: number): string {
  const score = frequency * confidence;
  if (score > 10) return "high";
  if (score > 5) return "medium";
  return "low";
}

/**
 * Truncate title to specified length
 */
function truncateTitle(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

/**
 * Sentiment analysis (simplified)
 */
export function analyzeSentiment(text: string): string {
  const positiveWords = [
    "great",
    "love",
    "excellent",
    "amazing",
    "wonderful",
    "perfect",
    "best",
    "good",
  ];
  const negativeWords = [
    "hate",
    "terrible",
    "awful",
    "bad",
    "poor",
    "worst",
    "horrible",
    "frustrated",
  ];

  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

/**
 * Calculate confidence score (0-1)
 */
export function calculateConfidence(frequency: number, maxFrequency: number): number {
  return Math.min(frequency / (maxFrequency > 0 ? maxFrequency : 1), 1);
}


/**
 * DATABASE AUTO-GENERATION FUNCTIONS
 * These functions take extracted insights and auto-generate themes, personas, and opportunities
 */

import { prisma } from "@/lib/prisma";
import type { InsightData } from "@/lib/insight-extractor";

/**
 * Auto-generate themes from extracted insights
 * Creates or updates themes in the database
 */
export async function generateThemesFromInsights(
  projectId: string,
  insights: InsightData
): Promise<number> {
  try {
    let createdOrUpdatedCount = 0;

    // Process extracted themes
    for (const extractedTheme of insights.themes) {
      // Check if theme already exists
      const existingTheme = await prisma.theme.findFirst({
        where: {
          projectId,
          name: extractedTheme.name,
        },
      });

      if (existingTheme) {
        // Update existing theme
        await prisma.theme.update({
          where: { id: existingTheme.id },
          data: {
            frequency: {
              increment: extractedTheme.frequency || 1,
            },
            description:
              extractedTheme.description || existingTheme.description,
            trend: "increasing",
            impact: extractedTheme.frequency
              ? extractedTheme.frequency > 5
                ? "high"
                : extractedTheme.frequency > 2
                  ? "medium"
                  : "low"
              : existingTheme.impact,
          },
        });
        createdOrUpdatedCount++;
      } else {
        // Create new theme
        await prisma.theme.create({
          data: {
            projectId,
            name: extractedTheme.name,
            description: extractedTheme.description,
            frequency: extractedTheme.frequency || 1,
            trend: "increasing",
            impact: extractedTheme.frequency
              ? extractedTheme.frequency > 5
                ? "high"
                : extractedTheme.frequency > 2
                  ? "medium"
                  : "low"
              : "medium",
          },
        });
        createdOrUpdatedCount++;
      }
    }

    // Also generate themes from pain points and feature requests
    const painPointTheme = await prisma.theme.findFirst({
      where: {
        projectId,
        name: "Pain Points",
      },
    });

    if (insights.painPoints.length > 0) {
      if (painPointTheme) {
        await prisma.theme.update({
          where: { id: painPointTheme.id },
          data: {
            frequency: {
              increment: insights.painPoints.length,
            },
          },
        });
      } else {
        await prisma.theme.create({
          data: {
            projectId,
            name: "Pain Points",
            description: "User pain points and frustrations identified",
            frequency: insights.painPoints.length,
            trend: "stable",
            impact: "high",
          },
        });
      }
      createdOrUpdatedCount++;
    }

    return createdOrUpdatedCount;
  } catch (error) {
    console.error("Error generating themes:", error);
    throw error;
  }
}

/**
 * Auto-generate personas from extracted insights
 * Creates or updates personas in the database
 */
export async function generatePersonasFromInsights(
  projectId: string,
  insights: InsightData
): Promise<number> {
  try {
    let createdOrUpdatedCount = 0;

    // Process extracted personas
    for (const extractedPersona of insights.personas) {
      const existingPersona = await prisma.persona.findFirst({
        where: {
          projectId,
          name: extractedPersona.name,
        },
      });

      if (existingPersona) {
        // Update existing persona
        const currentGoals = JSON.parse(existingPersona.goals || "[]");
        const currentPainPoints = JSON.parse(
          existingPersona.painPoints || "[]"
        );

        const updatedGoals = [
          ...new Set([
            ...currentGoals,
            ...(extractedPersona.goals || []),
          ]),
        ];
        const updatedPainPoints = [
          ...new Set([
            ...currentPainPoints,
            ...(extractedPersona.painPoints || []),
          ]),
        ];

        await prisma.persona.update({
          where: { id: existingPersona.id },
          data: {
            role:
              extractedPersona.jobTitle ||
              existingPersona.role,
            goals: JSON.stringify(updatedGoals),
            painPoints: JSON.stringify(updatedPainPoints),
            behavior:
              extractedPersona.behavior || existingPersona.behavior,
            documentCount: {
              increment: 1,
            },
            confidence: Math.min(
              100,
              Math.round(
                (existingPersona.confidence +
                  (extractedPersona.confidence || 60)) /
                  2
              )
            ),
            segment:
              extractedPersona.segment || existingPersona.segment,
          },
        });
        createdOrUpdatedCount++;
      } else {
        // Create new persona
        await prisma.persona.create({
          data: {
            projectId,
            name: extractedPersona.name,
            role: extractedPersona.jobTitle,
            description: `Persona: ${extractedPersona.name}`,
            goals: JSON.stringify(extractedPersona.goals || []),
            painPoints: JSON.stringify(
              extractedPersona.painPoints || []
            ),
            behavior: extractedPersona.behavior,
            confidence: extractedPersona.confidence || 60,
            segment: extractedPersona.segment,
            documentCount: 1,
          },
        });
        createdOrUpdatedCount++;
      }
    }

    return createdOrUpdatedCount;
  } catch (error) {
    console.error("Error generating personas:", error);
    throw error;
  }
}

/**
 * Auto-generate opportunities from extracted insights
 * Creates or updates opportunities in the database
 */
export async function generateOpportunitiesFromInsights(
  projectId: string,
  insights: InsightData
): Promise<number> {
  try {
    let createdOrUpdatedCount = 0;

    // Process extracted opportunities
    for (const extractedOpp of insights.opportunities) {
      const existingOpp = await prisma.opportunity.findFirst({
        where: {
          projectId,
          title: extractedOpp.title,
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
            description: extractedOpp.description,
            businessValue: extractedOpp.justification,
            timeToImplement: extractedOpp.estimatedEffort,
            impactLevel:
              extractedOpp.priority && extractedOpp.priority > 6
                ? "high"
                : extractedOpp.priority && extractedOpp.priority > 3
                  ? "medium"
                  : "low",
          },
        });
        createdOrUpdatedCount++;
      } else {
        // Create new opportunity
        await prisma.opportunity.create({
          data: {
            projectId,
            title: extractedOpp.title,
            description: extractedOpp.description,
            score: extractedOpp.priority ? extractedOpp.priority * 10 : 50,
            roi: extractedOpp.estimatedROI || 50,
            businessValue: extractedOpp.justification,
            timeToImplement: extractedOpp.estimatedEffort,
            impactLevel:
              extractedOpp.priority && extractedOpp.priority > 6
                ? "high"
                : extractedOpp.priority && extractedOpp.priority > 3
                  ? "medium"
                  : "low",
            confidence: 70,
            frequency: 1,
          },
        });
        createdOrUpdatedCount++;
      }
    }

    // Also generate opportunities from pain points
    if (insights.painPoints.length > 0) {
      const painPointOpp = await prisma.opportunity.findFirst({
        where: {
          projectId,
          title: "Resolve Top Pain Points",
        },
      });

      if (painPointOpp) {
        await prisma.opportunity.update({
          where: { id: painPointOpp.id },
          data: {
            frequency: {
              increment: 1,
            },
          },
        });
      } else {
        await prisma.opportunity.create({
          data: {
            projectId,
            title: "Resolve Top Pain Points",
            description: `Address ${insights.painPoints.length} identified user pain points`,
            score: 80,
            roi: 75,
            impactLevel: "high",
            confidence: 85,
            frequency: 1,
          },
        });
      }
      createdOrUpdatedCount++;
    }

    // Generate opportunities from feature requests
    if (insights.featureRequests.length > 0) {
      const featureOpp = await prisma.opportunity.findFirst({
        where: {
          projectId,
          title: "Implement Requested Features",
        },
      });

      if (featureOpp) {
        await prisma.opportunity.update({
          where: { id: featureOpp.id },
          data: {
            frequency: {
              increment: 1,
            },
          },
        });
      } else {
        await prisma.opportunity.create({
          data: {
            projectId,
            title: "Implement Requested Features",
            description: `Implement ${insights.featureRequests.length} requested features to increase user satisfaction`,
            score: 75,
            roi: 65,
            impactLevel: "high",
            confidence: 80,
            frequency: 1,
          },
        });
      }
      createdOrUpdatedCount++;
    }

    return createdOrUpdatedCount;
  } catch (error) {
    console.error("Error generating opportunities:", error);
    throw error;
  }
}
