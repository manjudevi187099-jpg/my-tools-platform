import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', currentSlug)
    .single();

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-4xl font-black text-slate-800 mb-4">Post Not Found 🕵️‍♂️</h1>
        <Link href="/" className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-purple-200">
      
      {/* 🌟 MINIMALIST PROFESSIONAL HEADER 🌟 */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {/* 🔥 NAYA LOGO ICON YAHAN LAGA DIYA HAI 🔥 */}
            <img src="/logo-icon.png" alt="Dhamaka Tools" className="w-10 h-10 object-contain drop-shadow-sm" />
            <span className="text-xl font-black text-slate-900 tracking-tight">DhamakaTools</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-purple-600 transition-colors flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full">
            ← Back to Tools
          </Link>
        </div>
      </header>

      <main className="flex-1">
        
        {/* 🌟 BLOG HERO SECTION 🌟 */}
        <div className="pt-20 pb-16 px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-black mb-6 uppercase tracking-widest">
            📚 Article
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight mb-10">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-center gap-4 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-3">
              {/* 🔥 AUTHOR KI DP MEIN BHI LOGO ICON LAGA DIYA HAI 🔥 */}
              <div className="w-12 h-12 rounded-full border border-slate-100 shadow-sm overflow-hidden bg-slate-50 flex items-center justify-center">
                 <img src="/logo-icon.png" alt="Author" className="w-8 h-8 object-contain" />
              </div>
              <div className="text-left">
                <p className="text-slate-900 font-black text-base">DhamakaTools Team</p>
                <p className="text-slate-500 text-sm">
                  {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • 5 min read
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Divider */}
        <div className="max-w-4xl mx-auto px-6">
          <hr className="border-slate-100" />
        </div>

        {/* 🌟 MAIN ARTICLE CONTENT 🌟 */}
        <article className="max-w-3xl mx-auto px-6 py-16">
          <div 
            className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium whitespace-pre-wrap 
                       [&>h2]:text-3xl [&>h2]:md:text-4xl [&>h2]:font-black [&>h2]:text-slate-900 [&>h2]:mt-16 [&>h2]:mb-6 
                       [&>h3]:text-2xl [&>h3]:font-black [&>h3]:text-slate-900 [&>h3]:mt-10 [&>h3]:mb-4 
                       [&>p]:mb-8 
                       [&>ul]:list-disc [&>ul]:ml-8 [&>ul]:mb-8 [&>li]:mb-2 
                       [&>strong]:text-slate-900 [&>strong]:font-black
                       [&>a]:text-purple-600 [&>a]:underline"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </article>

        {/* 🌟 FOOTER CALL TO ACTION (CTA) 🌟 */}
        <div className="bg-gradient-to-b from-white to-slate-50 border-t border-slate-100 py-24 px-6 text-center mt-10">
          <h3 className="text-3xl font-black text-slate-900 mb-4">Ready to boost your productivity?</h3>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto text-lg">
            Try our free, blazing-fast tools to edit, convert, and manage your documents in seconds. No sign-up required.
          </p>
          <Link href="/" className="inline-block bg-slate-900 text-white font-black px-10 py-5 rounded-2xl hover:bg-purple-600 transition-colors duration-300 shadow-xl shadow-slate-200">
            Explore All Tools 🚀
          </Link>
        </div>

      </main>
    </div>
  );
}