import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { blogService, blogAdsService, type BlogPost, type BlogAd } from '../services/blogService';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [inlineAds, setInlineAds] = useState<BlogAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const p = await blogService.getPostBySlug(slug);
        if (!p || !p.is_published) {
          navigate('/blog');
          return;
        }
        setPost(p);
        const [related, ads] = await Promise.all([
          blogService.getRelatedPosts(p.id, p.tags || [], 3),
          blogAdsService.getAdsForPosition('inline'),
        ]);
        setRelatedPosts(related);
        setInlineAds(ads);
      } catch (err: any) {
        console.error('Error loading blog post', err);
        setError('خطا در بارگذاری پست');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, navigate]);

  const canonicalUrl = useMemo(
    () => (slug ? `https://activelegend.ir/blog/${slug}` : 'https://activelegend.ir/blog'),
    [slug]
  );

  const jsonLd = useMemo(
    () =>
      post
        ? {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: post.cover_image_url || 'https://activelegend.ir/AE%20logo.svg',
            author: {
              '@type': 'Organization',
              name: 'Active Legend',
              url: 'https://activelegend.ir',
            },
            datePublished: post.created_at,
            dateModified: post.updated_at || post.created_at,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': canonicalUrl,
            },
          }
        : null,
    [post, canonicalUrl]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <p className="text-gray-300 mb-4">{error || 'پست پیدا نشد.'}</p>
        <Link to="/blog" className="btn-primary">
          بازگشت به بلاگ
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${post.title} | بلاگ اکتیو لجند`}</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${post.title} | بلاگ اکتیو لجند`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={post.cover_image_url || 'https://activelegend.ir/AE%20logo.svg'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | بلاگ اکتیو لجند`} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.cover_image_url || 'https://activelegend.ir/AE%20logo.svg'} />
      </Helmet>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="min-h-screen bg-black pt-20 md:pt-24 pb-12 md:pb-16 overflow-x-hidden">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-7 shadow-lg mb-8 md:mb-10 min-w-0">
            <header className="mb-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                {post.title}
              </h1>
              <p className="text-gray-300 text-sm md:text-base mb-3">{post.excerpt}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-black/40 text-gray-200 border border-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>
            {post.cover_image_url && (
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full rounded-2xl object-cover mb-6"
              />
            )}

            {/* Inline ad before content */}
            {inlineAds[0] && (
              <div
                className="ad-container ad-container-text mb-6"
                dangerouslySetInnerHTML={{ __html: inlineAds[0].html_snippet }}
              />
            )}

            <section
              className="blog-post-content prose prose-invert max-w-none min-w-0 overflow-x-auto prose-p:text-gray-100 prose-headings:text-white prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:max-w-full prose-img:h-auto"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content_html || ''),
              }}
            />

            {/* Inline ad after content */}
            {inlineAds[1] && (
              <div
                className="ad-container ad-container-text mt-6"
                dangerouslySetInnerHTML={{ __html: inlineAds[1].html_snippet }}
              />
            )}
          </article>

          {relatedPosts.length > 0 && (
            <section className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3 md:mb-4">پست‌های مرتبط</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {relatedPosts.map((rp) => (
                  <article
                    key={rp.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-md"
                  >
                    <Link to={`/blog/${rp.slug}`}>
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {rp.title}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-3">{rp.excerpt}</p>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

