import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogPost } from '../types';
import { INITIAL_ARTICLES } from '../data/academyData';
import { getPublishedBlogPosts } from '../lib/firestoreService';
import { ArrowRight, MagnifyingGlass, BookOpen } from '@phosphor-icons/react';

interface BlogListPageProps {
  onOpenTrial?: () => void;
}

const CATEGORIES = ['All', 'Tajweed', 'Quran Learning', 'Kids', 'Hifz', 'Islamic Studies'];

/** Category fallback pictures so EVERY blog card always shows a picture. */
const CATEGORY_IMAGES: Record<string, string> = {
  'Tajweed': '/images/unsplash/course-tajweed.webp',
  'Hifz': '/images/unsplash/course-hifz.webp',
  'Kids': '/images/unsplash/child-reading-quran.webp',
  'Islamic Studies': '/images/unsplash/course-islamic-studies.webp',
  'Duas & Salah': '/images/unsplash/mosque-interior.webp',
  'Parenting': '/images/unsplash/child-reading-quran.webp',
  'Quran Learning': '/images/unsplash/course-quran-reading.webp',
};

const postImage = (post: BlogPost): string =>
  post.featuredImage && post.featuredImage.trim() !== ''
    ? post.featuredImage
    : CATEGORY_IMAGES[post.category] || '/images/unsplash/hero-quran-dark.webp';

/** Reading time is always shown as 2–5 minutes (user request 2026-10-20). */
const clampReadTime = (rt?: string): string => {
  const n = parseInt(String(rt || ''), 10);
  if (!n || Number.isNaN(n)) return '3 min read';
  return `${Math.min(5, Math.max(2, n))} min read`;
};

const imgFallback = (post: BlogPost) => (e: React.SyntheticEvent<HTMLImageElement>) => {
  const el = e.currentTarget;
  const fb = CATEGORY_IMAGES[post.category] || '/images/unsplash/hero-quran-dark.webp';
  if (el.src !== window.location.origin + fb) el.src = fb;
};

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
        readTime: clampReadTime(a.readTime),
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

  // ⚡ Bolt: Memoize filtered posts to prevent expensive string comparisons and array filtering on every render
  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.metaDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [posts, activeCategory, searchQuery]);

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
    <section className="py-24 lg:py-32 bg-[#FAF7F0] border-b border-[#E7DBC2]/70 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-2xl mb-14 lg:mb-18">
          <p className="text-[11px] font-sans font-bold text-[#A47A46] uppercase tracking-widest mb-3.5">
            ESSAYS &amp; GUIDES
          </p>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[#13263D] leading-[1.12] font-semibold tracking-tight">
            Islamic Knowledge &amp; Insights
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 font-sans leading-relaxed">
            Scholarly articles on Tajweed rules, Quran memorization methods, parenting, and practical learning guides.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-16 pb-6 border-b border-[#E7DBC2]/60">
          <div className="relative flex-1 max-w-xs">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A47A46]" />
            <input
              type="search"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-sm border border-[#E7DBC2] text-xs font-sans focus:outline-none focus:border-[#13263D] bg-[#F5F0E6]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-sm text-xs font-sans transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#13263D] text-[#F5F0E6] font-semibold shadow-md'
                    : 'bg-[#F5F0E6] text-gray-600 hover:text-[#13263D] hover:border-[#A47A46] hover:-translate-y-0.5 border border-[#E7DBC2]/70'
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
            <div className="h-80 bg-[#F5F0E6] rounded-sm animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map(i => (
                <div key={i} className="h-64 bg-[#F5F0E6] rounded-sm animate-pulse" />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#F5F0E6] rounded-sm border border-[#E7DBC2]/70">
            <BookOpen className="w-10 h-10 text-[#A47A46] mx-auto mb-3" weight="regular" />
            <p className="text-gray-600 text-sm font-sans font-medium">No articles published yet in this category.</p>
          </div>
        ) : (
          <div className="space-y-20">
            
            {/* LAYER 1: Large Featured Article (Full-Width Editorial) */}
            {featuredPost && (
              <article
                onClick={() => handleNavigate(featuredPost.slug)}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center group cursor-pointer p-6 sm:p-10 bg-[#F5F0E6] border border-[#E7DBC2]/80 rounded-md transition-all duration-300 hover:border-[#A47A46] hover:shadow-[0_24px_48px_-16px_rgba(19,38,61,0.28)] hover:-translate-y-1"
              >
                <div className="lg:col-span-6 relative aspect-[16/10] overflow-hidden rounded-md bg-[#FAF7F0] border border-[#E7DBC2]/60">
                  <img
                    src={postImage(featuredPost)}
                    onError={imgFallback(featuredPost)}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#13263D]/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider bg-[#13263D] text-[#A47A46]">
                    Featured • {featuredPost.category}
                  </span>
                </div>

                <div className="lg:col-span-6 space-y-4 max-w-xl">
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-sans">
                    <span>{featuredPost.author}</span>
                    <span>•</span>
                    <span>{featuredPost.readTime}</span>
                  </div>

                  <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-[#13263D] font-semibold leading-[1.18] group-hover:text-[#A47A46] transition-colors duration-300">
                    {featuredPost.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed line-clamp-3">
                    {featuredPost.metaDescription || stripHtml(featuredPost.content).slice(0, 180) + '...'}
                  </p>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-[#13263D] group-hover:text-[#A47A46] transition-colors border-b-2 border-[#A47A46]/40 group-hover:border-[#A47A46] pb-0.5">
                      <span>Read Full Article</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </span>
                  </div>
                </div>
              </article>
            )}

            {/* LAYER 2: Secondary Posts (2-Column Editorial Grid) */}
            {secondaryPosts.length > 0 && (
              <div className="space-y-6">
                <p className="text-[11px] font-sans font-bold text-[#A47A46] uppercase tracking-widest">
                  FEATURED GUIDES
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {secondaryPosts.map(post => (
                    <article
                      key={post.id}
                      onClick={() => handleNavigate(post.slug)}
                      className="group flex flex-col overflow-hidden bg-[#F5F0E6] border border-[#E7DBC2]/70 rounded-md cursor-pointer transition-all duration-300 hover:border-[#A47A46] hover:shadow-[0_20px_40px_-14px_rgba(19,38,61,0.28)] hover:-translate-y-1.5"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-[#FAF7F0]">
                        <img
                          src={postImage(post)}
                          onError={imgFallback(post)}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#13263D]/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider bg-[#13263D]/90 text-[#F5F0E6]">
                          {post.category}
                        </span>
                      </div>

                      <div className="flex flex-col flex-1 justify-between gap-4 p-6">
                        <div className="space-y-3">
                          <h3 className="font-editorial text-2xl text-[#13263D] font-semibold leading-snug group-hover:text-[#A47A46] transition-colors duration-300 line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="text-xs text-gray-600 font-sans line-clamp-2 leading-relaxed">
                            {post.metaDescription || stripHtml(post.content).slice(0, 120) + '...'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs font-sans text-gray-500 pt-3 border-t border-[#E7DBC2]/50">
                          <span>{post.readTime}</span>
                          <span className="inline-flex items-center gap-1 font-bold text-[#13263D] group-hover:text-[#A47A46] transition-colors">
                            <span>Read</span>
                            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* LAYER 3: All Articles (Picture Card Grid — every blog has a picture) */}
            {listPosts.length > 0 && (
              <div className="space-y-6">
                <p className="text-[11px] font-sans font-bold text-[#A47A46] uppercase tracking-widest">
                  RECENT ARTICLES
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {listPosts.map(post => (
                    <article
                      key={post.id}
                      onClick={() => handleNavigate(post.slug)}
                      className="group flex flex-col overflow-hidden bg-[#F5F0E6] border border-[#E7DBC2]/70 rounded-md cursor-pointer transition-all duration-300 hover:border-[#A47A46] hover:shadow-[0_20px_40px_-14px_rgba(19,38,61,0.28)] hover:-translate-y-1.5"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-[#FAF7F0]">
                        <img
                          src={postImage(post)}
                          onError={imgFallback(post)}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#13263D]/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider bg-[#13263D]/90 text-[#F5F0E6]">
                          {post.category}
                        </span>
                      </div>

                      <div className="flex flex-col flex-1 justify-between gap-3 p-5">
                        <div className="space-y-2">
                          <h4 className="font-editorial text-lg text-[#13263D] font-semibold leading-snug group-hover:text-[#A47A46] transition-colors duration-300 line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-xs text-gray-600 font-sans line-clamp-2 leading-relaxed">
                            {post.metaDescription || stripHtml(post.content).slice(0, 110) + '...'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs font-sans text-gray-500 pt-3 border-t border-[#E7DBC2]/50">
                          <span>{post.readTime}</span>
                          <span className="inline-flex items-center gap-1 font-bold text-[#13263D] group-hover:text-[#A47A46] transition-colors">
                            <span>Read</span>
                            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>
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
