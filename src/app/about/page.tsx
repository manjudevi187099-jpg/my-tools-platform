export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-black text-slate-900 mb-6">About DhamakaTools</h1>
        <div className="w-20 h-1 bg-purple-500 mx-auto rounded-full mb-8"></div>
        <p className="text-lg text-slate-600 font-medium">
          Welcome to DhamakaTools, your all-in-one destination for powerful, fast, and free online tools designed to simplify your daily digital tasks. Our mission is to provide a modern platform where anyone can access high-quality utilities without installing software or creating complicated accounts.
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200 text-left space-y-10">
        
        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-4">What We Offer</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 font-medium">
            <li>📄 PDF Tools (Merge, Split, Compress, Convert, Protect)</li>
            <li>🖼️ Image Tools (Resize, Compress, Crop, Convert, BG Remover)</li>
            <li>🤖 AI Tools (Content Writer, Image Gen, Resume, Chat)</li>
            <li>💻 Developer Tools (JSON, Base64, Hash, Regex)</li>
            <li>🌐 SEO Tools (Meta, Keyword, Sitemap)</li>
            <li>✍️ Text Tools (Word Counter, Case, Duplicate Remover)</li>
            <li>🧮 Calculators (EMI, GST, Age, Percentage, BMI, Loan)</li>
            <li>📱 Social Media & 🎥 Video/Audio Utilities</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-4">Why Choose DhamakaTools?</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 font-medium">
            <li>⚡ Lightning-fast processing</li>
            <li>🔒 Secure and privacy-focused</li>
            <li>☁️ Cloud-based platform</li>
            <li>📱 Fully responsive on all devices</li>
            <li>🆓 Free to use</li>
            <li>🚀 No software installation required</li>
            <li>🌍 Accessible anytime, anywhere</li>
            <li>🔄 Regularly updated with new tools</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-4">Our Vision & Commitment</h2>
          <p className="text-slate-600 mb-4">Our vision is to become one of the most trusted online productivity platforms by providing hundreds of useful tools in one place. We continuously improve our platform by adding new features, enhancing performance, and delivering a seamless user experience.</p>
          <p className="text-slate-600">At DhamakaTools, we believe technology should be simple, accessible, and useful for everyone. We are committed to building reliable tools that help millions of users complete their work quickly, efficiently, and securely.</p>
          <p className="text-purple-600 font-bold mt-4">DhamakaTools – Smart Tools for Smarter Work. 🚀</p>
        </section>

      </div>
    </div>
  );
}