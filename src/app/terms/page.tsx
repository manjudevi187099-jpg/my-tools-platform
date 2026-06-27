export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-black text-slate-900 mb-6">Terms & Conditions</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest">Last Updated: June 26, 2026</p>
        <div className="w-20 h-1 bg-purple-500 mx-auto rounded-full mt-6 mb-8"></div>
        <p className="text-lg text-slate-600 font-medium">Welcome to DhamakaTools. By accessing or using DhamakaTools.com, you agree to comply with and be bound by these Terms & Conditions.</p>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200 text-left space-y-8">
        
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">1. Use of Our Services</h2>
          <p className="text-slate-600 mb-2">You agree to use our services only for lawful purposes. You must not:</p>
          <ul className="list-disc pl-6 text-slate-600 space-y-1">
            <li>Violate any applicable laws or regulations.</li>
            <li>Upload or share malicious software, viruses, or harmful files.</li>
            <li>Attempt to gain unauthorized access to our systems or services.</li>
            <li>Use our tools for fraudulent, illegal, or abusive activities.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">2. User Accounts & Intellectual Property</h2>
          <p className="text-slate-600">If you create an account, you are responsible for keeping your credentials secure. All content on DhamakaTools (logos, text, graphics, software) is the property of DhamakaTools and is protected by intellectual property laws. You may not copy or distribute content without permission.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">3. File Processing & Availability</h2>
          <p className="text-slate-600">Files are processed only to provide the requested service. Users are responsible for ensuring they have the legal right to upload their files. We strive to keep our services available at all times but do not guarantee uninterrupted operation.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">4. Limitation of Liability</h2>
          <p className="text-slate-600">DhamakaTools shall not be liable for any direct or indirect damages arising from the use of our services, loss of data, service interruptions, or technical errors. Users are encouraged to keep backups of important files.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">5. Termination & Governing Law</h2>
          <p className="text-slate-600">We reserve the right to suspend or terminate access to our services at any time if a user violates these Terms. These Terms shall be governed by the applicable laws of India. Any disputes shall be subject to the jurisdiction of the competent courts in India.</p>
          <p className="text-slate-600 font-bold mt-4">Support Email: help@dhamakatools.com</p>
        </section>

      </div>
    </div>
  );
}