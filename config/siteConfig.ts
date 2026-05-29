// config/siteConfig.ts
import DynamicPdfMerger from "../src/tools/pdf-merger";
import SplitPdf from "../src/tools/split-pdf"; // 👈 Naya Tool Import Kiya

export interface ToolMetadata {
  name: string;
  description: string;
  category: "pdf" | "dev" | "utility" | "design";
  keywords: string[];
  component: React.ComponentType;
}

export const toolsRegistry: Record<string, ToolMetadata> = {
  "pdf-merger": {
    name: "Professional PDF Merger",
    description: "Merge multiple PDF files into a single, high-quality document securely.",
    category: "pdf",
    keywords: ["pdf merger", "combine pdf", "join pdf tools"],
    component: DynamicPdfMerger,
  },
  
  // 👇 NAYA TOOL BASS YAHAN ADD KIYA HAI 👇
  "split-pdf": {
    name: "Split PDF Pro",
    description: "Extract specific pages or split a large PDF visually in seconds.",
    category: "pdf", 
    keywords: ["split pdf", "extract pages", "cut pdf"],
    component: SplitPdf, // 👈 Upar wala import yahan set kiya
  },
};