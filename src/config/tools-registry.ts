// 1. Interface Definition
export interface ToolMetadata {
  name: string;
  description: string;
  category: "pdf" | "dev" | "utility" | "design";
  keywords: string[];
  isActive: boolean; // 🌟 NAYA: Isse control kar sakte ho ki kaunsa tool site pe dikhe
}

// 2. Registry (Record<string, ToolMetadata>)
export const TOOLS_REGISTRY: Record<string, ToolMetadata> = {
  "pdf-merger": {
    name: "Professional PDF Merger",
    description: "Multiple PDFs ko ek me jodein securely.",
    category: "pdf",
    keywords: ["pdf merger", "combine pdf", "join pdf tools"],
    isActive: true,
  },
  "image-to-pdf": {
    name: "JPG to PDF",
    description: "Images (JPG, PNG) ko high-quality PDF me convert karein.",
    category: "pdf",
    keywords: ["image to pdf", "jpg to pdf", "convert images"],
    isActive: true,
  },
  "split-pdf": {
    name: "Split PDF Pro",
    description: "Badi PDF ko alag-alag panno me todein aur extract karein.",
    category: "pdf",
    keywords: ["split pdf", "extract pages", "cut pdf"],
    isActive: true,
  },
  "watermark-pdf": {
    name: "Add PDF Watermark",
    description: "Apne documents ko secure karne ke liye text watermark add karein.",
    category: "pdf",
    keywords: ["watermark pdf", "add text watermark", "secure pdf"],
    isActive: true,
  },
  "pdf-editor": {
    name: "Advanced PDF Editor",
    description: "All-in-one visual editor. Add text, erase content, and highlight shapes directly.",
    category: "pdf",
    keywords: ["pdf editor", "whiteout pdf", "add text to pdf"],
    isActive: true,
  },
  "pdf-to-word": {
    name: "PDF to Word Converter",
    description: "Extract text and paragraphs into an editable DOC file.",
    category: "pdf",
    keywords: ["pdf to word", "pdf to doc"],
    isActive: true,
  },
  "compress-pdf": {
    name: "PDF Compressor Engine",
    description: "Reduce PDF file size quickly right in your browser.",
    category: "pdf",
    keywords: ["compress pdf", "reduce pdf size"],
    isActive: true,
  },
  "unlock-pdf": {
    name: "Unlock PDF",
    description: "Remove passwords from your protected PDF files quickly.",
    category: "pdf",
    keywords: ["unlock pdf", "remove password"],
    isActive: true,
  },
  "protect-pdf": {
    name: "Protect PDF",
    description: "Add a secure password to your PDF file.",
    category: "pdf",
    keywords: ["protect pdf", "encrypt pdf"],
    isActive: true,
  },
  "invert-pdf": {
    name: "Invert PDF Colors",
    description: "Dark background wali PDF ko white background mein convert karein.",
    category: "pdf",
    keywords: ["invert pdf", "white background"],
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
    description: "Click and add custom stamps like VERIFIED or APPROVED.",
    category: "pdf",
    keywords: ["pdf stamper", "add stamp", "verified stamp"],
    isActive: true,
  },
"add-name-date": {
  name: "Add Name & Date",
  description: "Apni photo par naam aur date add karein taaki wo form filling ke liye ready rahe.",
  category: "utility",
  keywords: ["add name on photo", "photo editor"],
  isActive: true, // <--- YE 'true' hona chahiye
},

"photo-signature-joiner": {
  name: "Photo Signature Joiner",
  description: "Form bharne ke liye photo aur signature ko ek single image mein merge karein.",
  category: "utility",
  keywords: ["join photo signature", "merge image", "exam form photo"],
  isActive: true,
},

"age-calculator": {
    name: "Age Calculator",
    description: "Forms ke liye Date of Birth se exact age (Years, Months, Days) calculate karein.",
    category: "utility",
    keywords: ["age calculator", "calculate age", "dob calculator", "form age"],
    isActive: true,
  },
  "signature-on-photo": {
    name: "Signature On Photo",
    description: "Photo ke upar directly signature overlay karein (Transparent PNG style).",
    category: "utility",
    keywords: ["signature on photo", "overlay signature", "watermark signature", "self attest"],
    isActive: true,
  },
  "image-resizer": {
    name: "Photo & Signature Resizer",
    description: "Forms ke hisaab se image ko exact PX, CM, MM ya INCH dimensions mein resize karein.",
    category: "utility",
    keywords: ["image resizer", "photo resizer", "signature resizer", "resize to cm", "resize pixels"],
    isActive: true,
  },
  "remove-background": {
    name: "AI Background Remover",
    description: "AI ki madad se image ka background hatayein aur passport size photo ke liye naya color lagayein.",
    category: "design",
    keywords: ["remove bg", "background remover", "transparent image", "passport photo background"],
    isActive: true,
  },
  "passport-psd-maker": {
    name: "A4 Passport PSD Maker",
    description: "A4 paper par 6x7 (42 photos) ka passport size format banayein aur seedha .PSD file download karein.",
    category: "design",
    keywords: ["passport size photo maker", "psd generator", "a4 photo format", "studio photo grid"],
    isActive: true,
  },
  "smart-card-maker": {
    name: "Smart Card A4 PSD Maker",
    description: "PAN, Aadhaar, Voter ID jaise documents ko crop karein aur seedha A4 print sheet par perfectly arrange karke PSD download karein.",
    category: "utility",
    keywords: ["id card maker", "aadhaar print", "pan card print", "a4 smart card", "cr80 print format"],
    isActive: true,
  },
  "omr-sheet-maker": {
    name: "A4 OMR Sheet Generator",
    description: "Coaching aur Mock Tests ke liye 50, 100, 150 ya 200 questions wali print-ready OMR sheet PDF download karein.",
    category: "utility",
    keywords: ["omr maker", "omr sheet generator", "mock test sheet", "print omr a4", "bubble sheet"],
    isActive: true,
  },
  "typing-speed-test": {
    name: "Typing Speed Test Engine",
    description: "SSC, Railway, aur Data Entry exams ke liye apni typing speed (WPM) aur accuracy test karein. 1, 3, aur 5 minutes mode available.",
    category: "utility",
    keywords: ["typing test", "wpm checker", "typing speed calculator", "ssc typing test", "english typing"],
    isActive: true,
  },
};