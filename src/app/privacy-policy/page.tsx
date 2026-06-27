export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-black text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest">Last Updated: June 26, 2026</p>
        <div className="w-20 h-1 bg-purple-500 mx-auto rounded-full mt-6 mb-8"></div>
        <p className="text-lg text-slate-600 font-medium">Welcome to DhamakaTools ("we," "our," or "us"). Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your information when you use DhamakaTools.com.</p>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200 text-left space-y-8">
        
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">1. Information We Collect</h2>
          <p className="text-slate-600 mb-2">We may collect the following information:</p>
          <ul className="list-disc pl-6 text-slate-600 space-y-1">
            <li>Name (if provided)</li>
            <li>Email address (for support or account registration)</li>
            <li>Login information (if you create an account)</li>
            <li>Device and browser information & IP address</li>
            <li>Usage analytics & Uploaded files (only for processing through our tools)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-1">
            <li>Provide and improve our online tools & process uploaded files</li>
            <li>Respond to support requests & improve website performance</li>
            <li>Prevent fraud, abuse, and maintain website security</li>
            <li>Communicate important updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">3. File Privacy</h2>
          <p className="text-slate-600">Your uploaded files are processed securely. Files are used only to perform the requested task. We do not access or review your files unless required for troubleshooting with your permission. Temporary files may be automatically deleted after processing. We do not sell or share your uploaded files with third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">4. Cookies & Third-Party Services</h2>
          <p className="text-slate-600">We use cookies to remember your preferences, improve website performance, analyze traffic, and enhance user experience. We may use trusted third-party services (Analytics, Cloud storage, Payment processors, Authentication providers). These services have their own privacy policies.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">5. Data Security & Children's Privacy</h2>
          <p className="text-slate-600">We implement reasonable technical and organizational measures to protect your information. However, no method of internet transmission is completely secure. DhamakaTools is not intended for children under the age of 13.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">6. Your Rights & Contact</h2>
          <p className="text-slate-600 mb-4">Depending on your location, you may have the right to access, correct, or request deletion of your data. We may update this Privacy Policy from time to time.</p>
          <p className="text-slate-600 font-bold">Email: help@dhamakatools.com</p>
        </section>

      </div>
    </div>
  );
}