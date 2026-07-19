/**
 * File parsing utilities for different document formats
 */

export interface ParsedFileContent {
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    pages?: number;
    timestamp: Date;
  };
}

/**
 * Parse text files
 */
async function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Parse CSV files
 */
async function parseCSVFile(file: File): Promise<string> {
  const text = await parseTextFile(file);
  // Convert CSV to readable text format
  const lines = text.split("\n");
  const headers = lines[0]?.split(",") || [];
  const rows = lines.slice(1).filter((line) => line.trim());

  let result = `CSV File: ${file.name}\n`;
  result += `Rows: ${rows.length}\n\n`;

  // Show preview of first few rows
  result += "Data Preview:\n";
  result += headers.join(" | ") + "\n";
  result += "─".repeat(50) + "\n";

  rows.slice(0, 10).forEach((row) => {
    result += row + "\n";
  });

  if (rows.length > 10) {
    result += `... and ${rows.length - 10} more rows`;
  }

  return result;
}

/**
 * Parse PDF files (simplified - returns basic info)
 */
async function parsePDFFile(file: File): Promise<string> {
  // For now, we'll read the file as binary and extract what we can
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as ArrayBuffer;
      // Simple PDF text extraction (very basic)
      const view = new Uint8Array(data);
      let text = "PDF File: " + file.name + "\n";
      text += "File Size: " + (file.size / 1024).toFixed(2) + " KB\n\n";

      // Try to extract some text from PDF (very basic)
      let extractedText = "";
      for (let i = 0; i < view.length; i++) {
        const char = String.fromCharCode(view[i]);
        if (
          (char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126) ||
          char === "\n"
        ) {
          extractedText += char;
        }
      }

      // Clean up extracted text
      const cleanText = extractedText
        .replace(/\x00/g, "")
        .split("\n")
        .filter((line) => line.trim().length > 3)
        .slice(0, 20)
        .join("\n");

      text += "Content Preview:\n";
      text += cleanText || "[PDF content could not be extracted]";

      resolve(text);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse DOCX files (simplified)
 */
async function parseDOCXFile(file: File): Promise<string> {
  // For a full DOCX parser, we'd need a library like docx
  // For now, we'll provide basic file info and a placeholder
  let result = `Word Document: ${file.name}\n`;
  result += `File Size: ${(file.size / 1024).toFixed(2)} KB\n\n`;
  result += `Note: For full DOCX parsing, install the 'docx' library\n`;
  result += `Content: [DOCX document detected - basic parsing mode]\n`;

  // Try to extract some text
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as ArrayBuffer;
      const view = new Uint8Array(data);

      // Look for text in the XML
      let extractedText = "";
      for (let i = 0; i < view.length; i++) {
        const char = String.fromCharCode(view[i]);
        if (
          (char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126) ||
          char === "\n"
        ) {
          extractedText += char;
        }
      }

      // Extract text between XML tags
      const textMatches = extractedText.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
      const paragraphs = textMatches
        .map((match) => match.replace(/<[^>]+>/g, ""))
        .filter((text) => text.length > 0);

      result +=
        paragraphs.slice(0, 10).join("\n") ||
        "[No text content found in document]";

      if (paragraphs.length > 10) {
        result += `\n... and ${paragraphs.length - 10} more paragraphs`;
      }

      resolve(result);
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Main file parsing function
 */
export async function parseFile(file: File): Promise<ParsedFileContent> {
  let text = "";

  try {
    const ext = file.name.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "txt":
        text = await parseTextFile(file);
        break;
      case "csv":
        text = await parseCSVFile(file);
        break;
      case "pdf":
        text = await parsePDFFile(file);
        break;
      case "docx":
        text = await parseDOCXFile(file);
        break;
      case "xlsx":
        text = await parseCSVFile(file); // Treat as CSV-like
        break;
      default:
        // Try as text
        try {
          text = await parseTextFile(file);
        } catch {
          text = `File: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type || "Unknown"}\n\n[File could not be parsed]`;
        }
    }
  } catch (error) {
    text = `Error parsing file: ${error instanceof Error ? error.message : String(error)}`;
  }

  return {
    text,
    metadata: {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      timestamp: new Date(),
    },
  };
}

/**
 * Extract key phrases from text
 */
export function extractKeyPhrases(text: string, count: number = 10): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const phrases: Record<string, number> = {};

  // Simple word frequency analysis
  const stopwords = new Set([
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
    "with",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
  ]);

  words.forEach((word) => {
    const clean = word.replace(/[^a-z0-9]/g, "");
    if (clean.length > 3 && !stopwords.has(clean)) {
      phrases[clean] = (phrases[clean] || 0) + 1;
    }
  });

  return Object.entries(phrases)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([phrase]) => phrase);
}

/**
 * Detect sentiment of text
 */
export function detectSentiment(text: string): "positive" | "negative" | "neutral" {
  const positiveWords =
    /amazing|excellent|great|wonderful|love|perfect|fantastic|awesome|best|brilliant/gi;
  const negativeWords =
    /terrible|horrible|bad|worst|hate|awful|poor|disappointing|useless|broken/gi;

  const positive = (text.match(positiveWords) || []).length;
  const negative = (text.match(negativeWords) || []).length;

  if (positive > negative) return "positive";
  if (negative > positive) return "negative";
  return "neutral";
}

/**
 * Calculate text statistics
 */
export function getTextStats(text: string) {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    averageWordLength:
      words.reduce((sum, w) => sum + w.length, 0) / words.length || 0,
  };
}
