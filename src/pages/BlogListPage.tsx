import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogPost } from '../types';
import { INITIAL_ARTICLES } from '../data/academyData';
import { getPublishedBlogPosts } from '../lib/firestoreService';
import { ArrowRight, MagnifyingGlass, BookOpen } from '@phosphor-icons/react';

interface BlogListPageProps {
  onOpenTrial?: () => void;
}

const CATEGORIES = ['All', 'Tajweed', 'Quran Learning', 'Kids', 'Hifz', 'Islamic Studies'];

export const BlogListPage: React.FC<BlogListPageProps> = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Islamic Blog & Articles | Noor E Quran Institute';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Read expert articles on Tajweed rules, Quran memorization tips, kids Islamic education, and online Quran learning guides.');

    const mapInitialArticlesToBlogPosts = (): BlogPost[] => {
      return INITIAL_ARTICLES.map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        metaDescription: a.summary,
        featuredImage: a.category === 'Tajweed' ? '/images/courses/course-nazra-tajweed.webp' : a.category === 'Hifz' ? '/images/courses/course-hifz.webp' : '/images/banners/hero-banner.webp',
        content: a.content,
        category: (a.category === 'Tajweed' || a.category === 'Kids' || a.category === 'Hifz') ? a.category as any : 'Quran Learning',
        tags: [a.category, 'Quran', 'Islamic Education'],
        author: a.author,
        readTime: a.readTime,
        published: true,
        createdAt: a.publishedAt || '2026-02-01',
        updatedAt: a.publishedAt || '2026-02-01'
      }));
    };

    (async () => {
      try {
        const data = await getPublishedBlogPosts();
        if (data && data.length > 0) {
          setPosts(data);
        } else {
          setPosts(mapInitialArticlesToBlogPosts());
        }
      } catch (err) {
        console.warn('Loading baseline articles:', err);
        setPosts(mapInitialArticlesToBlogPosts());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => posts.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.metaDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }), [posts, activeCategory, searchQuery]);

  const featuredPost = filtered.length > 0 ? filtered[0] : null;
  const secondaryPosts = filtered.length > 1 ? filtered.slice(1, 3) : [];
  const listPosts = filtered.length > 3 ? filtered.slice(3) : [];

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleNavigate = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  return (
    <section className="py-24 lg:py-32 bg-[#FCFBF8] border-b border-[#E8E0D1]/70 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-2xl mb-14 lg:mb-18">
          <p className="text-[11px] font-sans font-bold text-[#B79A62] uppercase tracking-widest mb-3.5">
            ESSAYS &amp; GUIDES
          </p>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[#0B332D] leading-[1.12] font-semibold tracking-tight">
            Islamic Knowledge &amp; Insights
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 font-sans leading-relaxed">
            Scholarly articles on Tajweed rules, Quran memorization methods, parenting, and practical learning guides.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-16 pb-6 border-b border-[#E8E0D1]/60">
          <div className="relative flex-1 max-w-xs">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B79A62]" />
            <input
              type="search"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-sm border border-[#E8E0D1] text-xs font-sans focus:outline-none focus:border-[#0B332D] bg-[#F8F5EE]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-sm text-xs font-sans transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#0B332D] text-[#F8F5EE] font-semibold'
                    : 'bg-[#F8F5EE] text-gray-600 hover:text-[#0B332D] border border-[#E8E0D1]/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-8">
            <div className="h-80 bg-[#F8F5EE] rounded-sm animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map(i => (
                <div key={i} className="h-64 bg-[#F8F5EE] rounded-sm animate-pulse" />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#F8F5EE] rounded-sm border border-[#E8E0D1]/70">
            <BookOpen className="w-10 h-10 text-[#B79A62] mx-auto mb-3" weight="regular" />
            <p className="text-gray-600 text-sm font-sans font-medium">No articles published yet in this category.</p>
          </div>
        ) : (
          <div className="space-y-20">
            
            {/* LAYER 1: Large Featured Article (Full-Width Editorial) */}
            {featuredPost && (
              <article
                onClick={() => handleNavigate(featuredPost.slug)}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center group cursor-pointer p-6 sm:p-10 bg-[#F8F5EE] border border-[#E8E0D1]/80 rounded-sm hover:border-[#B79A62] transition-colors"
              >
                <div className="lg:col-span-6 relative aspect-[16/10] overflow-hidden rounded-sm bg-[#FCFBF8] border border-[#E8E0D1]/60">
                  {featuredPost.featuredImage ? (
                    <img
                      src={featuredPost.featuredImage}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0B332D] text-[#B79A62]">
                      <BookOpen className="w-12 h-12" weight="regular" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider bg-[#0B332D] text-[#B79A62]">
                    Featured • {featuredPost.category}
                  </span>
                </div>

                <div className="lg:col-span-6 space-y-4 max-w-xl">
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-sans">
                    <span>{featuredPost.author}</span>
                    <span>•</span>
                    <span>{featuredPost.readTime}</span>
                  </div>

                  <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-[#0B332D] font-semibold leading-[1.18] group-hover:text-[#07221E] transition-colors">
                    {featuredPost.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed line-clamp-3">
                    {featuredPost.metaDescription || stripHtml(featuredPost.content).slice(0, 180) + '...'}
                  </p>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-[#0B332D] group-hover:text-[#B79A62] transition-colors border-b border-[#0B332D]/20 pb-0.5">
                      <span>Read Full Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            )}

            {/* LAYER 2: Secondary Posts (2-Column Editorial Grid) */}
            {secondaryPosts.length > 0 && (
              <div className="space-y-6">
                <p className="text-[11px] font-sans font-bold text-[#B79A62] uppercase tracking-widest">
                  FEATURED GUIDES
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {secondaryPosts.map(post => (
                    <article
                      key={post.id}
                      onClick={() => handleNavigate(post.slug)}
                      className="group flex flex-col justify-between space-y-5 p-6 bg-[#F8F5EE] border border-[#E8E0D1]/70 rounded-sm cursor-pointer hover:border-[#B79A62] transition-colors"
                    >
                      <div className="space-y-4">
                        <div className="aspect-[16/9] overflow-hidden rounded-sm bg-[#FCFBF8] border border-[#E8E0D1]/60">
                          {post.featuredImage ? (
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#F8F5EE] text-[#0B332D]">
                              <BookOpen className="w-8 h-8 text-[#B79A62]" />
                            </div>
                          )}
                        </div>

                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#B79A62]">
                          {post.category}
                        </span>

                        <h3 className="font-editorial text-2xl text-[#0B332D] font-semibold leading-snug group-hover:text-[#07221E] transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-xs text-gray-600 font-sans line-clamp-2 leading-relaxed">
                          {post.metaDescription || stripHtml(post.content).slice(0, 120) + '...'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs font-sans text-gray-500 pt-3 border-t border-[#E8E0D1]/50">
                        <span>{post.readTime}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-[#0B332D] group-hover:text-[#B79A62] transition-colors">
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* LAYER 3: List Posts (Clean Editorial Rows) */}
            {listPosts.length > 0 && (
              <div className="space-y-6">
                <p className="text-[11px] font-sans font-bold text-[#B79A62] uppercase tracking-widest">
                  RECENT ARTICLES
                </p>

                <div className="divide-y divide-[#E8E0D1]/60 border-t border-b border-[#E8E0D1]/60">
                  {listPosts.map(post => (
                    <article
                      key={post.id}
                      onClick={() => handleNavigate(post.slug)}
                      className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group cursor-pointer hover:bg-[#F8F5EE]/40 transition-colors px-3"
                    >
                      <div className="md:col-span-2">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#B79A62]">
                          {post.category}
                        </span>
                      </div>

                      <div className="md:col-span-7">
                        <h4 className="font-editorial text-xl text-[#0B332D] font-semibold group-hover:text-[#B79A62] transition-colors line-clamp-1">
                          {post.title}
                        </h4>
                      </div>

                      <div className="md:col-span-3 flex md:justify-end items-center gap-3 text-xs text-gray-500 font-sans">
                        <span>{post.readTime}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#0B332D] group-hover:text-[#B79A62] inline-flex items-center gap-1">
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
};
