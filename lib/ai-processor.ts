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
 * Generate personas from insights and themes
 */
export function generatePersonasFromInsights(
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
