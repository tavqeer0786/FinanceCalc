import { useState } from 'react';
import { blogPosts, BlogPost } from '../data/blog';
import { ArrowLeft, BookOpen, Share2, Calendar, User, ArrowRight, Calculator, Check, Copy } from 'lucide-react';
import { motion } from 'motion/react';

interface BlogLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export function BlogLayout({ currentPath, navigate }: BlogLayoutProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  // Parse path to see if we are in a single post
  // Path format: /blog/slug
  const isSinglePost = currentPath.startsWith('/blog/') && currentPath !== '/blog';
  const postSlug = isSinglePost ? currentPath.replace('/blog/', '') : '';
  const activePost = blogPosts.find((p) => p.slug === postSlug);

  const categories = ['all', 'investing', 'mortgages', 'taxes', 'budgeting'];

  const filteredPosts = selectedCategory === 'all'
    ? blogPosts
    : blogPosts.filter((p) => p.category === selectedCategory);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Single Blog Post render
  if (isSinglePost && activePost) {
    return (
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 bg-gray-50/50 min-h-screen">
        {/* Back Button */}
        <button
          onClick={() => navigate('/blog')}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </button>

        {/* Post Container */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 lg:p-12">
          {/* Category Tag */}
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 capitalize mb-6">
            {activePost.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
            {activePost.title}
          </h1>

          {/* Author and Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-8 mb-8">
            <div className="flex items-center gap-3">
              <img
                src={activePost.author.avatarUrl}
                alt={activePost.author.name}
                className="h-10 w-10 rounded-full object-cover border border-gray-100"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">{activePost.author.name}</p>
                <p className="text-xs text-gray-500">{activePost.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {activePost.publishedAt}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {activePost.readTime}
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-600 font-medium transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Share2 className="h-3.5 w-3.5" />}
                {copied ? 'Copied URL!' : 'Share Article'}
              </button>
            </div>
          </div>

          {/* Body Content (Styled HTML-like parser) */}
          <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-6">
            {activePost.content.split('\n\n').map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              // Check for headings
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-xl font-bold text-gray-900 pt-4 mt-8 mb-4">
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('#### ')) {
                return (
                  <h4 key={index} className="text-lg font-bold text-gray-900 pt-2 mb-2">
                    {trimmed.replace('#### ', '')}
                  </h4>
                );
              }

              // Check for separator
              if (trimmed === '---') {
                return <hr key={index} className="my-8 border-t border-gray-100" />;
              }

              // Check for quotes
              if (trimmed.startsWith('*')) {
                // If it is italic block or simple quote
                if (trimmed.startsWith('* ') || trimmed.startsWith('** ')) {
                  // list items
                  const listItems = trimmed.split('\n').filter(Boolean);
                  return (
                    <ul key={index} className="list-disc pl-6 space-y-2 mb-4">
                      {listItems.map((li, i) => {
                        const cleanLi = li.replace(/^\*\s*/, '').replace(/^\d+\.\s*/, '');
                        // Parse bold if any
                        const isBoldPart = cleanLi.includes('**');
                        if (isBoldPart) {
                          const parts = cleanLi.split('**');
                          return (
                            <li key={i}>
                              {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-gray-900">{p}</strong> : p)}
                            </li>
                          );
                        }
                        return <li key={i}>{cleanLi}</li>;
                      })}
                    </ul>
                  );
                }
              }

              // Check for numbers list
              if (/^\d+\./.test(trimmed)) {
                const listItems = trimmed.split('\n').filter(Boolean);
                return (
                  <ol key={index} className="list-decimal pl-6 space-y-2 mb-4">
                    {listItems.map((li, i) => {
                      const cleanLi = li.replace(/^\d+\.\s*/, '');
                      const isBoldPart = cleanLi.includes('**');
                      if (isBoldPart) {
                        const parts = cleanLi.split('**');
                        return (
                          <li key={i}>
                            {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-gray-900">{p}</strong> : p)}
                          </li>
                        );
                      }
                      return <li key={i}>{cleanLi}</li>;
                    })}
                  </ol>
                );
              }

              // Check for blockquote
              if (trimmed.startsWith('> ') || trimmed.startsWith('**') && trimmed.endsWith('**')) {
                return (
                  <blockquote key={index} className="border-l-4 border-blue-500 bg-blue-50/40 px-5 py-4 rounded-r-xl my-6 text-gray-800 italic">
                    {trimmed.replace(/^>\s*/, '').replace(/\*\*/g, '')}
                  </blockquote>
                );
              }

              // Check for tables
              if (trimmed.includes('|') && trimmed.includes('\n')) {
                const lines = trimmed.split('\n');
                const headers = lines[0].split('|').map(s => s.trim()).filter(Boolean);
                const rows = lines.slice(2).map(line => line.split('|').map(s => s.trim()).filter(p => p !== ''));
                return (
                  <div key={index} className="overflow-x-auto my-6 border border-gray-100 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          {headers.map((h, hIdx) => (
                            <th key={hIdx} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-gray-50/50">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-4 py-3 text-sm text-gray-700 font-medium">
                                {cell.replace(/\*\*/g, '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              // Standard paragraph, replace formula symbols beautifully
              let cleanParagraph = trimmed
                .replace(/\$\$/g, '')
                .replace(/\\left\(/g, '(')
                .replace(/\\right\)/g, ')')
                .replace(/\\times/g, ' × ')
                .replace(/\\approx/g, ' ≈ ')
                .replace(/\\,/g, ' ');

              // Check for simple bold elements in paragraph
              if (cleanParagraph.includes('**')) {
                const parts = cleanParagraph.split('**');
                return (
                  <p key={index} className="text-gray-600 mb-4 text-base">
                    {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-gray-900">{p}</strong> : p)}
                  </p>
                );
              }

              return <p key={index} className="text-gray-600 mb-4 text-base">{cleanParagraph}</p>;
            })}
          </div>

          {/* Related Calculators Sidebar or Bottom Box */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Calculator className="h-4 w-4 text-blue-600" />
              Related Calculators
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activePost.relatedCalculators.map((calc) => (
                <div
                  key={calc.slug}
                  onClick={() => navigate(`/${calc.slug}`)}
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:border-blue-500 hover:bg-blue-50/20 transition-all duration-200 cursor-pointer group"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">{calc.name}</p>
                    <p className="text-[11px] text-gray-400">Launch calculation engine</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Directory of all posts
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-gray-50/30">
      
      {/* Blog Hero Heading */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Financial Insights & <span className="text-blue-600">Calculations</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 leading-relaxed">
          Authoritative articles dissecting wealth generation, mortgage planning, tax optimization, and everyday budgeting, designed to improve your financial literacy.
        </p>
      </div>

      {/* Category Search Filter Tabs */}
      <div className="flex flex-wrap justify-center items-center gap-2 mb-12 border-b border-gray-100 pb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15 scale-105'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post, idx) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-500/10 transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                {/* Category & Time */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span className="font-bold text-blue-600 capitalize">{post.category}</span>
                  <span>{post.readTime}</span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors leading-snug mb-3 cursor-pointer line-clamp-2"
                >
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              </div>

              {/* Author Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    className="h-8 w-8 rounded-full object-cover border border-gray-100"
                  />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{post.author.name}</p>
                    <p className="text-[10px] text-gray-400">{post.publishedAt}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
