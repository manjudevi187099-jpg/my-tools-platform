export interface ToolMetadata {
  name: string;
  description: string;
  category: "pdf" | "dev" | "utility" | "design" | "business";
  keywords: string[];
  isActive: boolean;
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
  "photo-signature-joiner": {
    name: "Photo Signature Joiner",
    description: "Form bharne ke liye photo aur signature ko ek single image mein merge karein.",
    category: "utility",
    keywords: ["join photo signature", "merge image", "exam form photo"],
    isActive: true,
  },
  "english-to-hindi-typing": {
    name: "English to Hindi Typing",
    description: "Type in English and automatically convert to Hindi text using fast phonetic transliteration.",
    category: "utility",
    keywords: ["english to hindi typing", "hindi transliteration", "hindi typing online"],
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
    description: "SSC, Railway, aur Data Entry exams ke liye apni typing speed (WPM) aur accuracy test karein.",
    category: "utility",
    keywords: ["typing test", "wpm checker", "typing speed calculator", "ssc typing test", "english typing"],
    isActive: true,
  },
  "resume-builder": {
    name: "Smart Resume / CV Builder",
    description: "Build professional, ATS-friendly A4 resumes in minutes with Live Preview and high-quality PDF export.",
    category: "utility",
    keywords: ["resume maker", "cv builder", "pdf resume", "job resume generator", "ats friendly cv"],
    isActive: true,
  },
  "biodata-maker": {
    name: "Marriage Biodata Maker",
    description: "Create beautiful, professional marriage biodata profiles in PDF format in just 2 minutes.",
    category: "utility",
    keywords: ["biodata maker", "marriage profile", "shaadi biodata", "matrimonial profile generator"],
    isActive: true,
  },
  "muslim-biodata-maker": {
    name: "Muslim Biodata Maker",
    description: "Create professional Islamic marriage biodata profiles in PDF format.",
    category: "utility",
    keywords: ["muslim biodata", "islamic marriage profile", "shaadi biodata", "matrimonial profile generator"],
    isActive: true,
  },
  "experience-letter-maker": {
    name: "Experience Letter Maker",
    description: "Generate professional Experience & Relieving Letters with company letterhead formatting and PDF export.",
    category: "business",
    keywords: ["experience letter", "relieving letter", "hr letter format", "work experience certificate"],
    isActive: true,
  },
  "invoice-maker": {
    name: "Pro Invoice Maker",
    description: "Generate professional business invoices with auto-calculated taxes, discounts, and HD PDF export.",
    category: "business",
    keywords: ["invoice generator", "bill maker", "gst invoice", "tax invoice", "business billing"],
    isActive: true,
  },
  "certificate-maker": {
    name: "Pro Certificate Generator",
    description: "Generate authentic, high-quality landscape certificates for courses and events with PDF/PNG export.",
    category: "design",
    keywords: ["certificate maker", "certificate generator", "award certificate", "course certificate", "event certificate"],
    isActive: true,
  },
  "stamp-maker": {
    name: "Digital Stamp & Seal Maker",
    description: "Generate professional round seals and rectangle rubber stamps. Download as transparent PNG or printable PDF.",
    category: "design",
    keywords: ["stamp maker", "digital seal", "round stamp generator", "rubber stamp", "company seal"],
    isActive: true,
  },
  "qr-generator": {
    name: "Mega QR Studio",
    description: "Generate URL, Text, WiFi, and VCard (Contact) QR Codes instantly in High Quality.",
    category: "utility",
    keywords: ["qr generator", "qr code maker", "wifi qr", "vcard qr", "mega qr studio", "barcode maker"],
    isActive: true,
  },
  "p2p-share": {
    name: "P2P Secure Share",
    description: "Send any size file directly between devices without servers. 100% private.",
    category: "utility",
    keywords: ["p2p share", "file transfer", "send large files", "direct transfer", "webrtc"],
    isActive: true,
  },
  "timer": {
    name: "Stopwatch & Timer",
    description: "Advanced browser-based stopwatch and countdown timer with background sync and alarms.",
    category: "utility",
    keywords: ["timer", "stopwatch", "countdown timer", "browser timer", "alarm timer", "study timer"],
    isActive: true,
  },

  // 🔥 YAHAN NAYA WALKIE TALKIE TOOL ADD KIYA HAI 🔥
  "walkie-talkie": {
    name: "Walkie Talkie P2P",
    description: "Free, private, push-to-talk voice chat directly in your browser. No signup required.",
    category: "utility",
    keywords: ["walkie talkie", "voice chat", "push to talk", "p2p audio", "browser radio"],
    isActive: true,
  }
};