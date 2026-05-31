export interface ToolMetadata {
  name: string;
  description: string;
  category: "pdf" | "dev" | "utility" | "design";
  keywords: string[];
  isActive: boolean; // 🌟 Control ke liye
}

export const toolsRegistry: Record<string, ToolMetadata> = {
  // --- PDF TOOLS ---
  "pdf-merger": {
    name: "Professional PDF Merger",
    description: "Merge multiple PDF files into a single, high-quality document securely.",
    category: "pdf",
    keywords: ["pdf merger", "combine pdf", "join pdf tools"],
    isActive: true,
  },
  "split-pdf": {
    name: "Split PDF Pro",
    description: "Extract specific pages or split a large PDF visually in seconds.",
    category: "pdf",
    keywords: ["split pdf", "extract pages", "cut pdf"],
    isActive: true,
  },
  "compress-pdf": {
    name: "PDF Compressor Engine",
    description: "Reduce PDF file size quickly right in your browser. 100% private.",
    category: "pdf",
    keywords: ["compress pdf", "reduce pdf size", "shrink pdf"],
    isActive: true,
  },
  "unlock-pdf": {
    name: "Unlock PDF",
    description: "Remove passwords from your protected PDF files quickly and securely.",
    category: "pdf",
    keywords: ["unlock pdf", "remove password", "decrypt pdf"],
    isActive: true,
  },
  "protect-pdf": {
    name: "Protect PDF",
    description: "Add a secure password to your PDF file to prevent unauthorized access.",
    category: "pdf",
    keywords: ["protect pdf", "encrypt pdf", "add password pdf"],
    isActive: true,
  },
  "image-to-pdf": {
    name: "Image to PDF",
    description: "Convert single or multiple JPG/PNG images into a high-quality PDF document.",
    category: "pdf",
    keywords: ["image to pdf", "jpg to pdf", "png to pdf", "convert images"],
    isActive: true,
  },
  "watermark-pdf": {
    name: "Add PDF Watermark",
    description: "Apne documents ko secure karne ke liye text watermark add karein.",
    category: "pdf",
    keywords: ["watermark pdf", "add text watermark", "secure pdf"],
    isActive: true,
  },
  "invert-pdf": {
    name: "Invert PDF Colors",
    description: "Dark background wali PDF ko white background mein convert karein.",
    category: "pdf",
    keywords: ["invert pdf", "white background", "pdf color fix"],
    isActive: true,
  },
  "remove-watermark": {
    name: "Remove PDF Watermark",
    description: "PDF se text watermark hatayein.",
    category: "pdf",
    keywords: ["remove watermark", "delete watermark"],
    isActive: true,
  }, 
  "pdf-stamper": {
    name: "PDF Stamper",
    description: "Click and add custom stamps like VERIFIED or APPROVED anywhere on your PDF.",
    category: "pdf",
    keywords: ["pdf stamper", "add stamp", "verified stamp", "custom pdf stamp"],
    isActive: true,
  },
  "pdf-editor": {
    name: "Advanced PDF Editor",
    description: "All-in-one visual editor. Add text, erase content with whiteout, and highlight shapes directly on your PDF.",
    category: "pdf",
    keywords: ["pdf editor", "whiteout pdf", "add text to pdf", "edit pdf online"],
    isActive: true,
  },
  "pdf-to-word": {
    name: "PDF to Word Converter",
    description: "Extract text and paragraphs into an editable DOC file. 100% Free & Secure.",
    category: "pdf",
    keywords: ["pdf to word", "pdf to doc", "convert pdf to word"],
    isActive: true,
  },

  // --- UTILITY / IMAGE TOOLS ---
  "add-name-date": {
    name: "Add Name & Date",
    description: "Apni photo par naam aur date add karein taaki wo form filling ke liye ready rahe.",
    category: "utility",
    keywords: ["add name on photo", "photo editor", "date on photo", "form photo"],
    isActive: true,
  },
};