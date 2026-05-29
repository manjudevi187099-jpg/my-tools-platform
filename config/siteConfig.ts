// config/siteConfig.ts
import dynamic from "next/dynamic";

// 🚀 Jadui Fix: ssr: false karne se Vercel inhe server par load nahi karega
const DynamicPdfMerger = dynamic(() => import("../src/tools/pdf-merger"), { ssr: false });
const SplitPdf = dynamic(() => import("../src/tools/split-pdf"), { ssr: false });

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
  "split-pdf": {
    name: "Split PDF Pro",
    description: "Extract specific pages or split a large PDF visually in seconds.",
    category: "pdf",
    keywords: ["split pdf", "extract pages", "cut pdf"],
    component: SplitPdf,
  },
};