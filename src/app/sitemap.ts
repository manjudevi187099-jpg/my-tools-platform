import { MetadataRoute } from 'next';
// ToolComponents ka import wahan se lein jahan aapne ise define kiya hai
// Agar slug.tsx mein hai, toh ise 'src/config/toolRegistry.ts' jaisi kisi nayi file mein rakhna behtar hai, 
// par abhi ke liye aap yahan manual array bana sakte hain:

export default function sitemap(): MetadataRoute.Sitemap {
  // Saare tools ki list yahan ek baar daal dein
  const tools = [
    "pdf-merger", "image-to-pdf", "split-pdf", "watermark-pdf", 
    "pdf-editor", "compress-pdf", "unlock-pdf", "protect-pdf", 
    "invert-pdf", "remove-watermark", "pdf-stamper", "add-name-date", 
    "photo-signature-joiner", "age-calculator", "signature-on-photo", 
    "image-resizer", "passport-psd-maker", "smart-card-maker", 
    "omr-sheet-maker", "typing-speed-test", "resume-builder", 
    "biodata-maker", "muslim-biodata-maker", "experience-letter-maker", 
    "invoice-maker", "certificate-maker", "stamp-maker", 
    "english-to-hindi-typing", "qr-generator", "p2p-share", 
    "timer", "walkie-talkie", "pro-suit-changer", "remove-bg"
  ];

  const sitemapData: MetadataRoute.Sitemap = [
    {
      url: 'https://dhamakatools.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Loop chalakar saare tools add ho gaye!
  tools.forEach((tool) => {
    sitemapData.push({
      url: `https://dhamakatools.com/tools/${tool}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  return sitemapData;
}