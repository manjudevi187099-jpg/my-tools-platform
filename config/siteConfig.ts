// config/siteConfig.ts
import DynamicPdfMerger from "../src/tools/pdf-merger";

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
};