export interface ToolMetadata {
  name: string;
  description: string;
  category: "pdf" | "dev" | "utility" | "design";
  keywords: string[];
}

export const toolsRegistry: Record<string, ToolMetadata> = {
  "pdf-merger": {
    name: "Professional PDF Merger",
    description: "Merge multiple PDF files into a single, high-quality document securely.",
    category: "pdf",
    keywords: ["pdf merger", "combine pdf", "join pdf tools"],
  },
  "split-pdf": {
    name: "Split PDF Pro",
    description: "Extract specific pages or split a large PDF visually in seconds.",
    category: "pdf",
    keywords: ["split pdf", "extract pages", "cut pdf"],
  },
  "compress-pdf": {
    name: "PDF Compressor Engine",
    description: "Reduce PDF file size quickly right in your browser. 100% private.",
    category: "pdf",
    keywords: ["compress pdf", "reduce pdf size", "shrink pdf"],
  },
  "unlock-pdf": {
    name: "Unlock PDF",
    description: "Remove passwords from your protected PDF files quickly and securely.",
    category: "pdf",
    keywords: ["unlock pdf", "remove password", "decrypt pdf"],
  },
  // 👇 YEH WALA BLOCK HONA ZAROORI HAI 👇
  "protect-pdf": {
    name: "Protect PDF",
    description: "Add a secure password to your PDF file to prevent unauthorized access.",
    category: "pdf",
    keywords: ["protect pdf", "encrypt pdf", "add password pdf"],
  }
};