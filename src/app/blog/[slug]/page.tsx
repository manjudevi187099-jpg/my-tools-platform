import { supabase } from '../../../lib/supabase';
import { notFound } from 'next/navigation';

export default async function BlogPost({ params }: { params: { slug: string } }) {
  // Database se blog fetch karna
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single();

  // Agar blog nahi mila toh 404 page dikhana
  if (error || !post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
          {post.title}
        </h1>
        <p className="text-slate-500 font-medium mb-10 pb-10 border-b border-slate-100 uppercase tracking-wider text-sm">
          Published on {new Date(post.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
        
        {/* 🔥 Yahan aapka article render hoga 🔥 */}
        <div 
          className="prose prose-lg prose-slate max-w-none font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </div>
    </div>
  );
}