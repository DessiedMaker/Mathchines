export interface ParsedSlide {
  title: string;
  subtitle: string;
  notes: string;
  bg?: string;
  color?: string;
  rawContent: string;
  bullets: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  mermaid?: string;
}

export interface ParsedDecks {
  productSlides: ParsedSlide[];
  investorSlides: ParsedSlide[];
}

export function parseMarkdownToDecks(markdown: string): ParsedDecks {
  // Normalize newlines
  const content = markdown.replace(/\r\n/g, "\n");

  // Locate the sections
  // We look for headings like `# 1. Product Pitch Deck` and `# 2. Investor & Growth Pitch Deck`
  const productSectionIndex = content.search(/#+\s+1\.\s+Product\s+Pitch\s+Deck/i);
  const investorSectionIndex = content.search(/#+\s+2\.\s+Investor\s+&\s+Growth\s+Pitch\s+Deck/i);

  let productMarkdown = "";
  let investorMarkdown = "";

  if (productSectionIndex !== -1) {
    const endOfProduct = investorSectionIndex !== -1 ? investorSectionIndex : content.length;
    productMarkdown = content.substring(productSectionIndex, endOfProduct);
  }

  if (investorSectionIndex !== -1) {
    investorMarkdown = content.substring(investorSectionIndex);
  }

  return {
    productSlides: parseDeck(productMarkdown),
    investorSlides: parseDeck(investorMarkdown),
  };
}

function parseDeck(deckMarkdown: string): ParsedSlide[] {
  if (!deckMarkdown.trim()) return [];

  const isSlideNumberFormat = deckMarkdown.includes("### Slide");
  let rawSlides: string[] = [];

  if (isSlideNumberFormat) {
    // Split by Slide headers but keep them in the chunk so we can parse titles
    const slideMatches = Array.from(deckMarkdown.matchAll(/### Slide \d+:\s*[^\n]*/gi));
    const splitIndices: number[] = [];
    for (const match of slideMatches) {
      if (match.index !== undefined) {
        splitIndices.push(match.index);
      }
    }
    
    for (let i = 0; i < splitIndices.length; i++) {
      const start = splitIndices[i];
      const end = i < splitIndices.length - 1 ? splitIndices[i + 1] : deckMarkdown.length;
      rawSlides.push(deckMarkdown.substring(start, end));
    }
  } else {
    // Split by slide separator "---" on its own line (with optional whitespace)
    rawSlides = deckMarkdown.split(/\n\s*---\s*\n/);
  }

  const slides: ParsedSlide[] = [];

  for (const rawSlide of rawSlides) {
    const trimmed = rawSlide.trim();
    if (!trimmed) continue;

    // Filter out slides that are just deck intro headers
    // (e.g. "# 1. Product Pitch Deck (v2.0)" or "_Making Math Enjoyable_")
    // If a slide only contains the main deck titles and no slide metadata comments, we skip it
    if (
      (trimmed.startsWith("# 1. Product Pitch Deck") ||
        trimmed.startsWith("## 1. Product Pitch Deck") ||
        trimmed.startsWith("# 2. Investor & Growth Pitch Deck") ||
        trimmed.startsWith("## 2. Investor & Growth Pitch Deck")) &&
      !trimmed.includes("bg:")
    ) {
      continue;
    }

    slides.push(parseSlide(trimmed));
  }

  return slides;
}

function parseSlide(slideText: string): ParsedSlide {
  const lines = slideText.split("\n");
  
  const props: Record<string, string> = {};
  const commentRegex = /<!--\s*([\w_-]+)\s*:\s*([^\s>]+)\s*-->/g;
  let match;
  
  // 1. Extract comments/metadata properties
  while ((match = commentRegex.exec(slideText)) !== null) {
    props[match[1]] = match[2];
  }

  // 2. Extract presenter notes
  const notesLines: string[] = [];
  const contentLines: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Ignore comment lines
    if (trimmedLine.startsWith("<!--") && trimmedLine.endsWith("-->")) {
      continue;
    }

    if (trimmedLine.startsWith(">")) {
      // It's a note line
      let noteText = trimmedLine.replace(/^>\s*/, "");
      // Remove "**Presenter Notes:**" header from notes if present
      noteText = noteText.replace(/^\*\*Presenter Notes:\*\*\s*/i, "");
      if (noteText) {
        notesLines.push(noteText);
      }
    } else {
      contentLines.push(line);
    }
  }

  const notes = notesLines.join("\n").trim();
  
  // 3. Process remaining content to find title, subtitle, bullets, tables, and mermaid
  let title = "";
  let subtitle = "";
  let bullets: string[] = [];
  let mermaidCode = "";
  let inMermaid = false;
  
  const tableRows: string[][] = [];
  let tableHeaders: string[] = [];
  let isTableDivider = false;

  const finalContentLines: string[] = [];

  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) continue;

    // Handle Mermaid block
    if (trimmedLine.startsWith("```mermaid")) {
      inMermaid = true;
      mermaidCode = "";
      continue;
    }
    if (inMermaid) {
      if (trimmedLine.startsWith("```")) {
        inMermaid = false;
      } else {
        mermaidCode += line + "\n";
      }
      continue;
    }

    // Extract Title (first line starting with '# ' or '### Slide')
    if (!title && (trimmedLine.startsWith("# ") || trimmedLine.toLowerCase().startsWith("### slide "))) {
      let parsedTitle = trimmedLine.startsWith("# ")
        ? trimmedLine.replace(/^#\s+/, "")
        : trimmedLine.replace(/^###\s+Slide\s+\d+:\s*/i, "");
      
      // Strip trailing parentheticals
      parsedTitle = parsedTitle.replace(/\s*\([^)]*\)\s*$/, "").trim();
      title = parsedTitle;
      continue;
    }

    // Extract Subtitle (first line starting with '### ' or enclosed in '_..._' or '*...*')
    if (!subtitle && title) {
      if (trimmedLine.startsWith("### ")) {
        subtitle = trimmedLine.replace(/^###\s+/, "");
        continue;
      } else if (
        (trimmedLine.startsWith("_") && trimmedLine.endsWith("_")) ||
        (trimmedLine.startsWith("*") && trimmedLine.endsWith("*"))
      ) {
        subtitle = trimmedLine.substring(1, trimmedLine.length - 1);
        continue;
      }
    }

    // Support custom Subtitle bullet label in PITCH.md
    if (!subtitle && (trimmedLine.startsWith("- **Subtitle**:") || trimmedLine.startsWith("- Subtitle:") || trimmedLine.startsWith("* **Subtitle**:") || trimmedLine.startsWith("* Subtitle:"))) {
      subtitle = trimmedLine.replace(/^[-*]\s+(\*\*Subtitle\*\*|Subtitle):\s*/i, "").trim();
      continue;
    }

    // Filter out metadata visuals labels (e.g. Presenter Notes header, Key Visuals header)
    const lowerLine = trimmedLine.toLowerCase();
    if (
      lowerLine.startsWith("- **presenter notes**") ||
      lowerLine.startsWith("- presenter notes") ||
      lowerLine.startsWith("* **presenter notes**") ||
      lowerLine.startsWith("* presenter notes") ||
      lowerLine.startsWith("- **key visuals**") ||
      lowerLine.startsWith("- key visuals") ||
      lowerLine.startsWith("* **key visuals**") ||
      lowerLine.startsWith("* key visuals")
    ) {
      continue;
    }

    // Parse bullet points
    if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
      bullets.push(trimmedLine.replace(/^[-*]\s+/, ""));
      continue;
    }

    // Parse tables
    if (trimmedLine.startsWith("|")) {
      const parts = trimmedLine
        .split("|")
        .map((p) => p.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1); // remove leading/trailing empty elements from outer pipes
      
      const isDivider = parts.every((p) => /^:?-+:?$/.test(p));
      if (isDivider) {
        isTableDivider = true;
      } else if (!isTableDivider && tableHeaders.length === 0) {
        tableHeaders = parts;
      } else {
        tableRows.push(parts);
      }
      continue;
    }

    finalContentLines.push(line);
  }

  const rawContent = finalContentLines.join("\n").trim();
  
  // 4. Custom Transformations for slide deck content mapping compatibility
  const titleLower = title.toLowerCase();
  if (titleLower === "primary personas") {
    // Convert bullet lists like: "**Ama / Nia (12-18 yrs) — The Struggling Student**: Wants..."
    // to the standard "Name · Role · Description: Details" split-friendly format
    bullets = bullets.map((b) => {
      const clean = b.replace(/\*\*/g, "").trim();
      if (clean.includes("—") && clean.includes(":")) {
        const parts = clean.split("—");
        const name = parts[0].trim();
        const rest = parts[1].split(":");
        const role = rest[0].trim();
        const desc = rest.slice(1).join(":").trim();
        return `${name} · ${role} · Description: ${desc}`;
      }
      return b;
    });
  } else if (titleLower.includes("monetization") || titleLower.includes("pricing")) {
    bullets = bullets.map((b) => {
      if (b.includes("**: ")) {
        return b.replace("**: ", " ** - ");
      }
      if (b.includes(": ")) {
        return b.replace(": ", " - ");
      }
      return b;
    });
  }

  let table: ParsedSlide["table"] = undefined;
  if (tableHeaders.length > 0) {
    table = {
      headers: tableHeaders,
      rows: tableRows,
    };
  }

  // Map comparison notes on "The Solution" to table structure automatically if it's text comparison
  if (titleLower === "the solution" && !table) {
    table = {
      headers: ["Before Mathchines", "After Mathchines"],
      rows: [
        ["**Frustrated & Stuck** · Gaps expand", "**Error Correction Engine** · Step-by-step guidance"],
        ["**Data Guzzlers** · Requires constant internet", "**Offline Sync Mode** · Download once, practice anywhere"],
        ["**Out-of-Sync Content** · Generic syllabi", "**Dual Syllabus Compiler** · GES & Western Common Core"]
      ]
    };
  }

  return {
    title: title.trim(),
    subtitle: subtitle.trim(),
    notes,
    bg: props.bg,
    color: props.color,
    rawContent,
    bullets,
    table,
    mermaid: mermaidCode.trim() || undefined,
  };
}
