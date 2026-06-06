import { supabase } from '../../../lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function BlogPost({ params }: { params: { slug: string } }) {
  // Database se blog fetch karna
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single();

  // Agar blog link galat ho, toh Next.js ka default 404 page dikhana
  if (error || !post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Simple Header */}
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
          
          {/* 🔥 Yahan aapka likha hua article render hoga 🔥 */}
          <div 
            className="prose prose-lg prose-slate max-w-none font-medium leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
          
        </article>
      </main>

    </div>
  );
}