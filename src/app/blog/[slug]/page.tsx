import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

// Next.js 14/15 safe params structure
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  // Slug ko safely extract karna
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;

  // Database se blog fetch karna
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', currentSlug)
    .single();

  // 🔴 AGAR DATABASE ERROR AAYE (Debug ke liye)
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-3xl font-black text-red-500 mb-2">Database Error 🐞</h1>
        <p className="text-slate-600 bg-white p-4 rounded-xl border border-red-200">{error.message}</p>
        <p className="mt-4 text-sm text-slate-500">Hint: Sayad Supabase mein RLS enabled hai.</p>
      </div>
    );
  }

  // 🔴 AGAR BLOG DATABASE MEIN NA MILE (Debug ke liye)
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-3xl font-black text-slate-800 mb-2">Blog Missing in DB 🕵️‍♂️</h1>
        <p className="text-slate-600 bg-white p-4 rounded-xl border border-slate-200">Humne yeh URL dhundha: <b>{currentSlug}</b> par database mein nahi mila.</p>
      </div>
    );
  }

  // ✅ AGAR SAB THEEK HAI TOH BLOG DIKHAO
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-3xl bg-slate-100 p-2 rounded-xl border border-slate-200 shadow-sm">🛠️</span>
            <span className="text-xl font-black text-slate-900 tracking-tight">PdfNexa</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-purple-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Blog Content */}
      <main className="flex-1 py-16 px-4">
        <article className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-10 pb-10 border-b border-slate-100">
            <div className="bg-purple-100 text-purple-700 font-bold text-xs px-3 py-1 rounded-full uppercase">
              Article
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">
              Published on {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
          
          {/* Content Render */}
          <div 
            className="prose prose-lg prose-slate max-w-none font-medium leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
          
        </article>
      </main>

    </div>
  );
}