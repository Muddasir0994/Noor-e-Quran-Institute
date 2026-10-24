import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Clock } from '@phosphor-icons/react';

export const AUTHOR_NAME = 'M Muddasir Hameed';
export const AUTHOR_PROFILE_PATH = '/author/m-muddasir-hameed';
export const AUTHOR_PROFILE_URL = `https://noorequraninstitute.me${AUTHOR_PROFILE_PATH}`;
export const AUTHOR_BIO =
  'M Muddasir Hameed is an Islamic scholar, researcher, and founder of Noor E Quran Institute. He holds a Bachelor of Islamic Studies, an M.A.-equivalent (Aalmia) in Islamic & Arabic Studies, and a post-graduate specialization in Islamic Jurisprudence (Takhassus fil Fiqh).';

interface AuthorArticle {
  slug: string;
  title: string;
  summary?: string;
  metaDescription?: string;
  category?: string;
  readTime?: string;
  createdAt?: string;
  featuredImage?: string;
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${AUTHOR_PROFILE_URL}#person`,
  name: AUTHOR_NAME,
  url: AUTHOR_PROFILE_URL,
  image: 'https://noorequraninstitute.me/images/author/m-muddasir-hameed.jpg',
  jobTitle: 'Islamic Scholar, Researcher & Founder',
  worksFor: {
    '@type': 'EducationalOrganization',
    name: 'Noor E Quran Institute',
    url: 'https://noorequraninstitute.me/'
  },
  description: AUTHOR_BIO
};

const AuthorPage: React.FC = () => {
  const [articles, setArticles] = useState<AuthorArticle[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/blog-posts')
      .then(r => (r.ok ? r.json() : []))
      .then((data: any) => {
        if (cancelled) return;
        const posts: AuthorArticle[] = Array.isArray(data) ? data : data?.posts || [];
        setArticles(posts.slice(0, 12));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="py-20 lg:py-28 bg-[#FAF7F0] min-h-screen">
      <Helmet>
        <title>{`${AUTHOR_NAME} — Founder & Author | Noor E Quran Institute`}</title>
        <meta
          name="description"
          content={AUTHOR_BIO}
        />
        <link rel="canonical" href={AUTHOR_PROFILE_URL} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={AUTHOR_PROFILE_URL} />
        <meta property="og:title" content={`${AUTHOR_NAME} — Founder & Author | Noor E Quran Institute`} />
        <meta
          property="og:description"
          content={AUTHOR_BIO}
        />
        <meta property="og:image" content="https://noorequraninstitute.me/images/author/m-muddasir-hameed.jpg" />
        <meta property="og:site_name" content="Noor E Quran Institute" />
        <script type="application/ld+json">{JSON.stringify(personSchema)}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile card */}
        <div className="bg-white border border-[#E7DBC2] rounded-sm p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-center sm:items-start shadow-sm">
          <img
            src="/images/author/m-muddasir-hameed.jpg"
            alt={AUTHOR_NAME}
            className="w-36 h-36 rounded-full object-cover border-4 border-[#F5F0E6] shrink-0"
          />
          <div className="text-center sm:text-left">
            <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#A47A46]">
              Founder & Author
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl text-[#13263D] font-semibold mt-2">
              {AUTHOR_NAME}
            </h1>
            <p className="font-sans text-sm sm:text-[15px] leading-relaxed text-gray-600 mt-4">
              {AUTHOR_BIO}
            </p>
          </div>
        </div>

        {/* Articles by the author */}
        <h2 className="font-editorial text-2xl text-[#13263D] font-semibold mt-14 mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#A47A46]" />
          Articles by {AUTHOR_NAME}
        </h2>
        {articles.length === 0 ? (
          <p className="font-sans text-sm text-gray-500">Loading articles…</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {articles.map(a => (
              <a
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="group bg-white border border-[#E7DBC2] rounded-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {a.featuredImage && !a.featuredImage.startsWith('data:') && (
                  <div className="aspect-[16/9] overflow-hidden bg-[#F5F0E6]">
                    <img
                      src={a.featuredImage}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-5">
                  {a.category && (
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#A47A46]">
                      {a.category}
                    </span>
                  )}
                  <h3 className="font-editorial text-lg text-[#13263D] font-semibold leading-snug mt-1.5 group-hover:text-[#A47A46] transition-colors">
                    {a.title}
                  </h3>
                  {(a.summary || a.metaDescription) && (
                    <p className="font-sans text-[13px] text-gray-500 leading-relaxed mt-2 line-clamp-2">
                      {a.summary || a.metaDescription}
                    </p>
                  )}
                  {a.readTime && (
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-sans mt-3">
                      <Clock className="w-3.5 h-3.5 text-[#A47A46]" />
                      {a.readTime}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { AuthorPage };
export default AuthorPage;
