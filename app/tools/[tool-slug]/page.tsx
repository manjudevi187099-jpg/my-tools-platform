import { notFound } from "next/navigation";
import { toolsRegistry } from "../../../config/siteConfig";
import React from "react";

interface Props {
  params: Promise<{ "tool-slug": string }>;
}

// 1. Static Compilation: Isse saare tools build time par automatic compile ho jayenge (Blazing Fast Performance)
export async function generateStaticParams() {
  return Object.keys(toolsRegistry).map((slug) => ({
    "tool-slug": slug,
  }));
}

// 2. Dynamic SEO Handler
export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const tool = toolsRegistry[resolvedParams["tool-slug"]];
  if (!tool) return {};

  return {
    title: `${tool.name} | Professional Free Online Utilities`,
    description: tool.description,
    keywords: tool.keywords.join(", "),
  };
}

// 3. Main Dynamic Application Page
export default async function ToolPage({ params }: Props) {
  const resolvedParams = await params;
  const tool = toolsRegistry[resolvedParams["tool-slug"]];

  // Agar routing tree me register nahi hai to direct standard 404 page dikhao
  if (!tool) {
    notFound();
  }

  const ToolComponent = tool.component;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{tool.name}</h1>
        <p style={{ color: '#475569', marginTop: '0.5rem' }}>{tool.description}</p>
      </header>
      
      <main style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', overflow: 'hidden' }}>
        <ToolComponent />
      </main>
    </div>
  );
}