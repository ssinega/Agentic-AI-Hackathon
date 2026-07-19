/**
 * Advanced file parsing utilities for PDF, DOCX, CSV, XLSX, and TXT formats
 * Extracts text and metadata from documents for analysis
 */

export interface ParsedFileContent {
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    pages?: number;
    rows?: number;
    columns?: number;
    timestamp: Date;
  };
}

/**
 * Parse plain text files
 */
async function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        resolve(text || "");
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Parse CSV files
 */
async function parseCSVFile(file: File): Promise<string> {
  try {
    const text = await parseTextFile(file);
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length === 0) return `CSV File: ${file.name}\n[Empty file]`;

    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1);

    let result = `CSV File: ${file.name}\n`;
    result += `Rows: ${rows.length}\n`;
    result += `Columns: ${headers.length}\n\n`;

    // Headers
    result += "Column Headers:\n";
    result += headers.join(" | ") + "\n";
    result += "─".repeat(80) + "\n\n";

    // Show first 20 rows as preview
    result += "Data Preview (first 20 rows):\n";
    rows.slice(0, 20).forEach((row, idx) => {
      result += `${idx + 1}. ${row}\n`;
    });

    if (rows.length > 20) {
      result += `\n... and ${rows.length - 20} more rows\n`;
    }

    return result;
  } catch (error) {
    throw new Error(
      `Failed to parse CSV: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Parse Excel/XLSX files using XLSX library
 */
async function parseXLSXFile(file: File): Promise<string> {
  try {
    // Dynamically import xlsx to avoid issues with bundling
    const XLSX = (await import("xlsx")).default;

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
      type: "array",
    });

    let result = `Excel File: ${file.name}\n`;
    result += `Sheets: ${workbook.SheetNames.length}\n\n`;

    // Process each sheet
    workbook.SheetNames.slice(0, 5).forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      result += `\n=== Sheet: ${sheetName} ===\n`;
      result += `Rows: ${data.length}\n`;

      if (data.length > 0) {
        const maxCols = Math.max(...(data as any[]).map((row: any[]) => row.length));
        result += `Columns: ${maxCols}\n\n`;

        // Show headers and first 15 rows
        result += "Data Preview:\n";
        (data as any[]).slice(0, 15).forEach((row: any[], idx: number) => {
          result += `${idx + 1}. ${row.map((cell) => String(cell || "")).join(" | ")}\n`;
        });

        if (data.length > 15) {
          result += `\n... and ${data.length - 15} more rows\n`;
        }
      }
    });

    if (workbook.SheetNames.length > 5) {
      result += `\n... and ${workbook.SheetNames.length - 5} more sheets\n`;
    }

    return result;
  } catch (error) {
    throw new Error(
      `Failed to parse Excel: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Parse PDF files using pdfjs-dist
 */
async function parsePDFFile(file: File): Promise<string> {
  try {
    // Dynamically import pdfjs to handle worker setup
    const pdfjsLib = await import("pdfjs-dist");
    const { getDocument } = pdfjsLib;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;

    let result = `PDF File: ${file.name}\n`;
    result += `Pages: ${pdf.numPages}\n\n`;

    const textPromises = [];

    // Extract text from first 20 pages (limit to avoid huge documents)
    for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 20); pageNum++) {
      textPromises.push(
        pdf.getPage(pageNum).then((page) =>
          page.getTextContent().then((content) => {
            return content.items
              .map((item: any) => item.str)
              .join("")
              .trim();
          })
        )
      );
    }

    const pageTexts = await Promise.all(textPromises);

    result += "Page Content Preview:\n";
    result += "─".repeat(80) + "\n\n";

    pageTexts.forEach((text, idx) => {
      if (text.trim()) {
        result += `Page ${idx + 1}:\n`;
        // Show first 500 chars of each page
        result += text.substring(0, 500);
        if (text.length > 500) result += "...";
        result += "\n\n";
      }
    });

    if (pdf.numPages > 20) {
      result += `\n... and content from ${pdf.numPages - 20} more pages\n`;
    }

    return result;
  } catch (error) {
    // Fallback: try basic binary parsing if pdfjs fails
    console.warn("pdfjs parsing failed, attempting fallback:", error);
    return parsePDFFallback(file);
  }
}

/**
 * Fallback PDF parsing using binary extraction
 */
async function parsePDFFallback(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const view = new Uint8Array(data);

        let text = `PDF File: ${file.name}\n`;
        text += `File Size: ${(file.size / 1024).toFixed(2)} KB\n\n`;

        // Extract readable text from binary
        let extractedText = "";
        for (let i = 0; i < view.length; i++) {
          const char = String.fromCharCode(view[i]);
          if (
            (char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126) ||
            char === "\n" ||
            char === "\r" ||
            char === "\t"
          ) {
            extractedText += char;
          }
        }

        // Clean up and show preview
        const cleanText = extractedText
          .replace(/\x00/g, "")
          .split("\n")
          .filter((line) => line.trim().length > 3)
          .slice(0, 30)
          .join("\n");

        text += "Content Preview:\n";
        text += cleanText || "[PDF content could not be fully extracted]";

        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse DOCX files (Word documents)
 * Basic implementation using binary parsing of the ZIP structure
 */
async function parseDOCXFile(file: File): Promise<string> {
  try {
    // Try to use JSZip if available, otherwise fall back to binary parsing
    const arrayBuffer = await file.arrayBuffer();
    const view = new Uint8Array(arrayBuffer);

    // DOCX is a ZIP file, try to extract XML and text
    let result = `Word Document: ${file.name}\n`;
    result += `File Size: ${(file.size / 1024).toFixed(2)} KB\n\n`;

    // Look for text in the binary (DOCX XML structure)
    let extractedText = "";
    for (let i = 0; i < view.length; i++) {
      const char = String.fromCharCode(view[i]);
      if (
        (char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126) ||
        char === "\n" ||
        char === "\r" ||
        char === "\t"
      ) {
        extractedText += char;
      }
    }

    // Extract text between XML tags (DOCX uses w:t tags for text)
    // eslint-disable-next-line no-useless-escape
    const tagPattern = /<w:t[^>]*>([^<]+)<\/w:t>/g;
    // eslint-disable-next-line no-useless-escape
    const cleanTagPattern = /<[^>]+>/g;
    const textMatches = extractedText.match(tagPattern) || [];
    const paragraphs = textMatches
      .map((match) => {
        const content = match.replace(cleanTagPattern, "");
        return content.trim();
      })
      .filter((text) => text.length > 0);




    if (paragraphs.length === 0) {
      // If no DOCX tags found, try to extract any readable text
      const cleanText = extractedText
        .replace(/\x00/g, "")
        .split("\n")
        .filter((line) => line.trim().length > 3)
        .slice(0, 20);
      result += "Content Preview:\n";
      result += cleanText.join("\n") || "[No text content found]";
    } else {
      result += `Paragraphs: ${paragraphs.length}\n\n`;
      result += "Content Preview:\n";
      result += paragraphs.slice(0, 20).join("\n");

      if (paragraphs.length > 20) {
        result += `\n... and ${paragraphs.length - 20} more paragraphs`;
      }
    }

    return result;
  } catch (error) {
    throw new Error(
      `Failed to parse DOCX: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Parse Excel files (.xls) - older format
 */
async function parseXLSFile(file: File): Promise<string> {
  // For .xls files, try to read as text or use XLSX library
  try {
    const XLSX = (await import("xlsx")).default;
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });

    let result = `Excel File (.xls): ${file.name}\n`;
    result += `Sheets: ${workbook.SheetNames.length}\n\n`;

    workbook.SheetNames.slice(0, 5).forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      result += `\n=== Sheet: ${sheetName} ===\n`;
      result += `Rows: ${data.length}\n`;

      if (data.length > 0) {
        const maxCols = Math.max(...(data as any[]).map((row: any[]) => row.length));
        result += `Columns: ${maxCols}\n\n`;

        result += "Data Preview:\n";
        (data as any[]).slice(0, 15).forEach((row: any[], idx: number) => {
          result += `${idx + 1}. ${row.map((cell) => String(cell || "")).join(" | ")}\n`;
        });

        if (data.length > 15) {
          result += `\n... and ${data.length - 15} more rows\n`;
        }
      }
    });

    return result;
  } catch (error) {
    throw new Error(
      `Failed to parse XLS: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Main file parsing function - routes to appropriate parser based on file type
 */
export async function parseFile(file: File): Promise<ParsedFileContent> {
  let text = "";
  let metadata: ParsedFileContent["metadata"] = {
    fileName: file.name,
    fileType: file.type || "unknown",
    fileSize: file.size,
    timestamp: new Date(),
  };

  try {
    const ext = file.name.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "txt":
        text = await parseTextFile(file);
        break;

      case "pdf":
        text = await parsePDFFile(file);
        // Count pages from text preview
        const pageMatches = text.match(/Page \d+:/g);
        metadata.pages = pageMatches ? pageMatches.length : 1;
        break;

      case "csv":
        text = await parseCSVFile(file);
        // Extract row/column info
        const rowMatch = text.match(/Rows: (\d+)/);
        const colMatch = text.match(/Columns: (\d+)/);
        if (rowMatch) metadata.rows = parseInt(rowMatch[1]);
        if (colMatch) metadata.columns = parseInt(colMatch[1]);
        break;

      case "xlsx":
      case "xls":
        // XLSX/XLS files
        if (ext === "xlsx") {
          text = await parseXLSXFile(file);
        } else {
          text = await parseXLSFile(file);
        }
        // Extract row/column info
        const xlsRowMatch = text.match(/Rows: (\d+)/);
        const xlsColMatch = text.match(/Columns: (\d+)/);
        if (xlsRowMatch) metadata.rows = parseInt(xlsRowMatch[1]);
        if (xlsColMatch) metadata.columns = parseInt(xlsColMatch[1]);
        break;

      case "docx":
      case "doc":
        text = await parseDOCXFile(file);
        break;

      default:
        // Try to parse as text by default
        try {
          text = await parseTextFile(file);
          if (!text.trim()) {
            text = `File: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type || "Unknown"}\n\n[Could not extract text from this file format]`;
          }
        } catch {
          text = `File: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type || "Unknown"}\n\n[File type not supported for text extraction]`;
        }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Error parsing file ${file.name}:`, error);
    text = `Error parsing file: ${errorMsg}\n\nFile: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB`;
  }

  return {
    text,
    metadata,
  };
}

/**
 * Extract key phrases from text using word frequency analysis
 */
export function extractKeyPhrases(text: string, count: number = 10): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const phrases: Record<string, number> = {};

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
    "as",
    "if",
    "all",
    "each",
    "every",
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
export function detectSentiment(
  text: string
): "positive" | "negative" | "neutral" {
  const positiveWords =
    /amazing|excellent|great|wonderful|love|perfect|fantastic|awesome|best|brilliant|good|happy|satisfied|impressed|impressed|delighted/gi;
  const negativeWords =
    /terrible|horrible|bad|worst|hate|awful|poor|disappointing|useless|broken|frustrated|angry|upset|sad|unhappy|issue|problem|bug/gi;

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
