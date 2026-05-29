export type ToolCategory = 'Merge & Organize' | 'Convert To PDF' | 'Optimize & Repair' | 'Convert From PDF' | 'Edit & Format PDF' | 'PDF Security' | 'PDF Intelligence';

export interface ToolMeta {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ToolCategory;
  isActive: boolean;
}

export const TOOLS_REGISTRY: ToolMeta[] = [
  {
    id: 'pdf-merger',
    name: 'Merge PDF',
    slug: 'pdf-merger',
    description: 'Multiple PDFs ko ek me jodein securely.',
    category: 'Merge & Organize',
    isActive: true,
  },
  {
    id: 'image-to-pdf',
    name: 'JPG to PDF',
    slug: 'image-to-pdf',
    description: 'Images (JPG, PNG) ko high-quality PDF me convert karein.',
    category: 'Convert To PDF',
    isActive: true,
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    slug: 'split-pdf',
    description: 'Badi PDF ko alag-alag panno me todein aur extract karein.',
    category: 'Merge & Organize',
    isActive: true, // Naya tool yahan active kar diya hai
  }
];