import DOMPurify from "dompurify";
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BlogPost } from '../types';
import { INITIAL_ARTICLES } from '../data/academyData';
import { getBlogPostBySlug, getPublishedBlogPosts } from '../lib/firestoreService';
import { Clock, User, ArrowLeft, BookOpen } from '@phosphor-icons/react';

interface BlogPostPageProps {
  onOpenTrial?: () => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ onOpenTrial }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const onNavigateBack = () => navigate('/blog');
  const onNavigate = (s: string) => navigate(`/blog/${s}`);

  useEffect(() => {
    if (!slug) {
      navigate('/blog');
      return;
    }

    (async () => {
      setLoading(true);
      let data: BlogPost | null = null;
      try {
        data = await getBlogPostBySlug(slug);
      } catch (err) {
        console.warn('Error querying Firestore for blog post:', err);
      }

      if (!data) {
        const article = INITIAL_ARTICLES.find(a => a.slug === slug || a.id === slug);
        if (article) {
          data = {
            id: article.id,
            slug: article.slug,
            title: article.title,
            metaDescription: article.summary,
            featuredImage: article.category === 'Tajweed' ? '/images/courses/course-nazra-tajweed.webp' : article.category === 'Hifz' ? '/images/courses/course-hifz.webp' : '/images/banners/hero-banner.webp',
            content: article.content,
            category: (article.category === 'Tajweed' || article.category === 'Kids' || article.category === 'Hifz') ? article.category as any : 'Quran Learning',
            tags: [article.category, 'Quran', 'Islamic Education'],
            author: article.author,
            readTime: article.readTime,
            published: true,
            createdAt: article.publishedAt || '2026-02-01',
            updatedAt: article.publishedAt || '2026-02-01'
          };
        }
      }

      setPost(data);

      if (data) {
        try {
          const all = await getPublishedBlogPosts();
          if (all && all.length > 0) {
            setRelated(all.filter(p => p.category === data!.category && p.id !== data!.id).slice(0, 3));
          } else {
            const fallbackRelated = INITIAL_ARTICLES
              .filter(a => a.slug !== slug)
              .slice(0, 3)
              .map(a => ({
                id: a.id,
                slug: a.slug,
                title: a.title,
                metaDescription: a.summary,
                featuredImage: a.category === 'Tajweed' ? '/images/courses/course-nazra-tajweed.webp' : a.category === 'Hifz' ? '/images/courses/course-hifz.webp' : '/images/banners/hero-banner.webp',
                content: a.content,
                category: (a.category === 'Tajweed' || a.category === 'Kids' || a.category === 'Hifz') ? a.category as any : 'Quran Learning',
                tags: [a.category],
                author: a.author,
                readTime: a.readTime,
                published: true,
                createdAt: a.publishedAt || '2026-02-01',
                updatedAt: a.publishedAt || '2026-02-01'
              }));
            setRelated(fallbackRelated);
          }
        } catch {
          const fallbackRelated = INITIAL_ARTICLES
            .filter(a => a.slug !== slug)
            .slice(0, 3)
            .map(a => ({
              id: a.id,
              slug: a.slug,
              title: a.title,
              metaDescription: a.summary,
              featuredImage: a.category === 'Tajweed' ? '/images/courses/course-nazra-tajweed.webp' : a.category === 'Hifz' ? '/images/courses/course-hifz.webp' : '/images/banners/hero-banner.webp',
              content: a.content,
              category: (a.category === 'Tajweed' || a.category === 'Kids' || a.category === 'Hifz') ? a.category as any : 'Quran Learning',
              tags: [a.category],
              author: a.author,
              readTime: a.readTime,
              published: true,
              createdAt: a.publishedAt || '2026-02-01',
              updatedAt: a.publishedAt || '2026-02-01'
            }));
          setRelated(fallbackRelated);
        }
      }
      setLoading(false);
    })();
    window.scrollTo(0, 0);
  }, [slug, navigate]);

  if (loading) {
    return (
      <section className="py-24 min-h-screen bg-[#FCFBF8]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#F8F5EE] rounded-sm w-3/4" />
            <div className="h-72 bg-[#F8F5EE] rounded-sm" />
            <div className="space-y-3">
              <div className="h-4 bg-[#F8F5EE] rounded-sm w-full" />
              <div className="h-4 bg-[#F8F5EE] rounded-sm w-5/6" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="py-24 min-h-screen bg-[#FCFBF8] text-center">
        <BookOpen className="w-12 h-12 text-[#B79A62] mx-auto mb-4" />
        <h2 className="text-2xl font-editorial font-bold text-[#0B332D] mb-2">Article Not Found</h2>
        <p className="text-gray-500 text-xs font-sans mb-6">This blog article may have been moved or does not exist.</p>
        <button
          onClick={onNavigateBack}
          className="px-6 py-2.5 rounded-sm bg-[#0B332D] text-[#F8F5EE] text-xs font-semibold uppercase tracking-wider hover:bg-[#07221E] transition-colors cursor-pointer"
        >
          ← Return to Blog
        </button>
      </section>
    );
  }

  const canonicalUrl = `https://noorequraninstitute.me/blog/${post.slug}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    image: post.featuredImage || 'https://noorequraninstitute.me/branding/logo.png',
    author: {
      '@type': 'Person',
      name: post.author || 'Noor E Quran Institute Scholar'
    },
    publisher: {
      '@type': 'EducationalOrganization',
      name: 'Noor E Quran Institute',
      logo: {
        '@type': 'ImageObject',
        url: 'https://noorequraninstitute.me/branding/logo.webp'
      }
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    }
  };

  return (
    <article className="py-20 lg:py-28 bg-[#FCFBF8] min-h-screen">
      <Helmet>
        <title>{`${post.title} | Noor E Quran Institute`}</title>
        <meta name="title" content={`${post.title} | Noor E Quran Institute`} />
        <meta name="description" content={post.metaDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription} />
        {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
        <meta property="og:site_name" content="Noor E Quran Institute" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.metaDescription} />
        {post.featuredImage && <meta name="twitter:image" content={post.featuredImage} />}

        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <button
            onClick={onNavigateBack}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-[#0B332D] hover:text-[#B79A62] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </button>
        </div>

        {/* Article Header */}
        <header className="space-y-4 mb-10 pb-8 border-b border-[#E8E0D1]">
          <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#B79A62]">
            {post.category}
          </span>

          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#0B332D] font-semibold leading-[1.14] tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-sans pt-1">
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <User className="w-3.5 h-3.5 text-[#B79A62]" />
              <span>{post.author}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#B79A62]" />
              <span>{post.readTime}</span>
            </span>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-12 aspect-[16/9] overflow-hidden rounded-sm border border-[#E8E0D1] bg-[#F8F5EE]">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div className="prose prose-lg max-w-none text-gray-700 font-sans leading-relaxed space-y-6">
          <div
            className="whitespace-pre-line text-sm sm:text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
        </div>

        {/* In-Article Conversion Callout Banner */}
        <div className="my-14 p-8 bg-[#0B332D] text-[#F8F5EE] rounded-sm space-y-4 border border-[#B79A62]/30">
          <p className="text-[11px] font-sans font-bold text-[#B79A62] uppercase tracking-widest">
            1-ON-1 PERSONALIZED TUITION
          </p>
          <h3 className="font-editorial text-2xl sm:text-3xl text-[#F8F5EE] font-semibold">
            Ready to Begin Your Quran Journey with a Certified Scholar?
          </h3>
          <p className="text-xs sm:text-sm text-[#E8E0D1]/80 font-sans leading-relaxed max-w-xl">
            Experience our compassionate, interactive teaching approach with male or female verified teachers.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={onOpenTrial}
              className="px-6 py-3 bg-[#B79A62] text-[#07221E] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#D8C7A3] transition-colors cursor-pointer shadow-xs"
            >
              Book 3-Day Free Trial
            </button>
            <button
              onClick={onNavigateBack}
              className="px-6 py-3 border border-[#E8E0D1]/40 text-[#F8F5EE] text-xs font-semibold uppercase tracking-wider rounded-sm hover:border-[#B79A62] transition-colors cursor-pointer"
            >
              Explore More Articles
            </button>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="pt-12 border-t border-[#E8E0D1] space-y-6">
            <p className="text-[11px] font-sans font-bold text-[#B79A62] uppercase tracking-widest">
              RELATED ARTICLES
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => onNavigate(rel.slug)}
                  className="group p-4 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm cursor-pointer hover:border-[#B79A62] transition-colors space-y-2"
                >
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#B79A62]">
                    {rel.category}
                  </span>
                  <h4 className="font-editorial text-lg text-[#0B332D] font-semibold line-clamp-2 group-hover:text-[#07221E]">
                    {rel.title}
                  </h4>
                  <span className="text-xs text-gray-500 font-sans block pt-1">{rel.readTime}</span>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </article>
  );
};
