export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 text-center">
      <h1 className="text-5xl font-black text-slate-900 mb-6">Contact Support</h1>
      <p className="text-xl text-slate-500 mb-12">We are here to help you.</p>
      <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-sm border border-slate-200">
        <p className="text-slate-600 font-medium mb-6">Email us at:</p>
        <a href="mailto:support@dhamakatools.com" className="text-2xl font-black text-purple-600 hover:underline">
          support@dhamakatools.com
        </a>
      </div>
    </div>
  );
}