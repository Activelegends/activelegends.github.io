import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { blogService, blogAdsService, type BlogPost, type BlogAd } from '../services/blogService';
import BlogComments from '../components/BlogComments';
import { BlogCommentsErrorBoundary } from '../components/BlogCommentsErrorBoundary';
import AdSnippet from '../components/AdSnippet';
import { yektanetService, type YektanetPlacement } from '../services/yektanetService';
import type { ReactNode } from 'react';

// ثابت‌ها برای جلوگیری از اعداد جادویی
const MAX_RELATED_POSTS = 3;
const BASE_URL = 'https://activelegend.ir';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [inlineAds, setInlineAds] = useState<BlogAd[]>([]);
  const [sidebarAds, setSidebarAds] = useState<BlogAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ykPlacements, setYkPlacements] = useState<YektanetPlacement[]>([]);

  // ایالت‌های مجزا برای خطاهای بخش‌های فرعی (اختیاری، برای مدیریت بهتر)
  const [relatedError, setRelatedError] = useState<string | null>(null);
  const [adsError, setAdsError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    // FIX: استفاده از AbortController برای لغو درخواست‌های ناتمام هنگام unmount
    const abortController = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setRelatedError(null);
        setAdsError(null);

        // دریافت پست اصلی (با پشتیبانی از abort signal)
        const postData = await blogService.getPostBySlug(slug, { signal: abortController.signal });
        if (!postData || !postData.is_published) {
          navigate('/blog');
          return;
        }
        setPost(postData);

        // FIX: استفاده از Promise.allSettled برای جلوگیری از شکست کامل در صورت خطای یکی از سرویس‌ها
        const [relatedResult, inlineResult, sidebarResult, ykResult] = await Promise.allSettled([
          blogService.getRelatedPosts(postData.id, postData.tags || [], MAX_RELATED_POSTS),
          blogAdsService.getAdsForPosition('inline'),
          blogAdsService.getAdsForPosition('sidebar'),
          yektanetService.getActiveForBlogPost(),
        ]);

        // پردازش نتایج هر درخواست به صورت جداگانه
        if (relatedResult.status === 'fulfilled') {
          setRelatedPosts(relatedResult.value);
        } else {
          console.error('Failed to load related posts', relatedResult.reason);
          setRelatedError('بارگذاری پست‌های مرتبط با مشکل مواجه شد.');
        }

        if (inlineResult.status === 'fulfilled') {
          setInlineAds(inlineResult.value);
        } else {
          console.error('Failed to load inline ads', inlineResult.reason);
          setAdsError(prev => (prev ? prev + '\n' : '') + 'خطا در بارگذاری تبلیغات درون‌متنی.');
        }

        if (sidebarResult.status === 'fulfilled') {
          setSidebarAds(sidebarResult.value);
        } else {
          console.error('Failed to load sidebar ads', sidebarResult.reason);
          setAdsError(prev => (prev ? prev + '\n' : '') + 'خطا در بارگذاری تبلیغات کناری.');
        }

        if (ykResult.status === 'fulfilled') {
          setYkPlacements(ykResult.value);
        } else {
          console.error('Failed to load Yektanet placements', ykResult.reason);
          // خطای یکتانت می‌تواند نادیده گرفته شود چون تأثیری در محتوای اصلی ندارد
        }
      } catch (err: unknown) {
        // FIX: بررسی abort شده بودن خطا
        if (abortController.signal.aborted) return;

        console.error('Error loading blog post', err);
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری پست');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      abortController.abort();
    };
  }, [slug, navigate]);

  // FIX: محاسبه canonicalUrl با useMemo
  const canonicalUrl = useMemo(
    () => (slug ? `${BASE_URL}/blog/${slug}` : `${BASE_URL}/blog`),
    [slug]
  );

  // FIX: محاسبه jsonLd با useMemo
  const jsonLd = useMemo(
    () =>
      post
        ? {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: post.cover_image_url || `${BASE_URL}/AE%20logo.svg`,
            author: {
              '@type': 'Organization',
              name: 'Active Legend',
              url: BASE_URL,
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

  // فیلتر کردن مکان‌های یکتانت
  const ykStart = useMemo(
    () => ykPlacements.filter((p) => p.position === 'post_start' && p.enabled),
    [ykPlacements]
  );
  const ykEnd = useMemo(
    () => ykPlacements.filter((p) => p.position === 'post_end' && p.enabled),
    [ykPlacements]
  );
  const ykSidebar = useMemo(
    () => ykPlacements.filter((p) => p.position === 'sidebar' && p.enabled),
    [ykPlacements]
  );
  const ykMiddle = useMemo(
    () => ykPlacements.filter((p) => p.position === 'post_middle' && p.enabled),
    [ykPlacements]
  );

  // FIX: بهینه‌سازی تابع رندر محتوا با useCallback (برای جلوگیری از تعریف مجدد)
  const renderContentWithYektanet = useCallback((html: string, middle: YektanetPlacement[]): ReactNode => {
    // FIX: استفاده از DOMParser به جای split ناامن روی HTML
    const sanitized = DOMPurify.sanitize(html || '');
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'text/html');
    // استخراج تمام پاراگراف‌ها (تگ‌های p)
    const paragraphs = Array.from(doc.body.children).filter(el => el.tagName === 'P');

    if (!middle.length) {
      // اگر تبلیغ میانی نداریم، تمام محتوا را یکجا برگردان
      return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
    }

    const nodes: ReactNode[] = [];

    // پردازش هر پاراگراف و درج تبلیغ در موقعیت‌های مشخص‌شده
    paragraphs.forEach((p, idx) => {
      // شماره پاراگراف (از ۱ شروع می‌شود)
      const paragraphIndex = idx + 1;

      // اضافه کردن خود پاراگراف
      nodes.push(
        <div
          key={`p-${paragraphIndex}`}
          dangerouslySetInnerHTML={{ __html: p.outerHTML }}
        />
      );

      // بررسی شرایط درج تبلیغ
      middle.forEach((placement) => {
        const start = placement.insert_after_paragraph ?? 0; // می‌تواند صفر باشد (قبل از پاراگراف اول)
        const every = placement.repeat_every_paragraph ?? 0;

        // FIX: پشتیبانی از start = 0 (قبل از پاراگراف اول) با بررسی جداگانه
        if (start === 0 && paragraphIndex === 1) {
          // درج قبل از پاراگراف اول
          nodes.push(
            <AdSnippet
              key={`${placement.key}-before-first`}
              html={placement.html_code}
              className="yk-slot yk-slot-middle my-4"
            />
          );
        }

        // درج بعد از پاراگراف‌های مشخص (start > 0)
        const shouldInsertOnce = start > 0 && every === 0 && paragraphIndex === start;
        const shouldInsertRepeated =
          start > 0 && every > 0 && paragraphIndex >= start && (paragraphIndex - start) % every === 0;

        if (shouldInsertOnce || shouldInsertRepeated) {
          nodes.push(
            <AdSnippet
              key={`${placement.key}-${paragraphIndex}`}
              html={placement.html_code}
              className="yk-slot yk-slot-middle my-4"
            />
          );
        }
      });
    });

    return nodes;
  }, []);

  // FIX: استفاده از useMemo برای ذخیره محتوای نهایی با تبلیغات (جلوگیری از محاسبه مجدد در هر رندر)
  const contentWithAds = useMemo(
    () => (post ? renderContentWithYektanet(post.content_html || '', ykMiddle) : null),
    [post, ykMiddle, renderContentWithYektanet]
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
        <meta property="og:image" content={post.cover_image_url || `${BASE_URL}/AE%20logo.svg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | بلاگ اکتیو لجند`} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.cover_image_url || `${BASE_URL}/AE%20logo.svg`} />
      </Helmet>

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="min-h-screen bg-black pt-20 md:pt-24 pb-12 md:pb-16 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 lg:gap-8">
            {/* ستون اصلی */}
            <div className="min-w-0">
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
                          // IMPROVEMENT: استفاده از rem به جای px (text-xs = 0.75rem)
                          className="text-xs px-2 py-0.5 rounded-full bg-black/40 text-gray-200 border border-white/10"
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
                    // IMPROVEMENT: اضافه کردن loading="lazy"
                    loading="lazy"
                    className="w-full rounded-2xl object-cover mb-6"
                  />
                )}

                {/* تبلیغات شروع (یکتانت) */}
                {ykStart.map((p) => (
                  <AdSnippet key={p.key} html={p.html_code} className="yk-slot yk-slot-start mb-6" />
                ))}

                {/* تبلیغ درون‌متنی قبل از محتوا (غیر یکتانت) */}
                {inlineAds[0] && (
                  <AdSnippet html={inlineAds[0].html_snippet} className="sponsor-box sponsor-box-text mb-6" />
                )}

                {/* محتوای اصلی با تبلیغات میانی */}
                <section className="blog-post-content prose prose-invert max-w-none min-w-0 overflow-x-auto prose-p:text-gray-100 prose-headings:text-white prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:max-w-full prose-img:h-auto">
                  {contentWithAds}
                </section>

                {/* تبلیغات پایان (یکتانت) */}
                {ykEnd.map((p) => (
                  <AdSnippet key={p.key} html={p.html_code} className="yk-slot yk-slot-end mt-6" />
                ))}

                {/* تبلیغ درون‌متنی بعد از محتوا (غیر یکتانت) */}
                {inlineAds[1] && (
                  <AdSnippet html={inlineAds[1].html_snippet} className="sponsor-box sponsor-box-text mt-6" />
                )}

                {/* نمایش خطاهای بخش تبلیغات (اختیاری) */}
                {adsError && (
                  <div className="text-xs text-yellow-500 mt-2 p-2 bg-yellow-500/10 rounded">
                    {adsError}
                  </div>
                )}

                <BlogCommentsErrorBoundary>
                  <BlogComments postId={post.id} />
                </BlogCommentsErrorBoundary>
              </article>

              {/* پست‌های مرتبط */}
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

              {/* نمایش خطای پست‌های مرتبط */}
              {relatedError && (
                <p className="text-xs text-gray-400 mt-2">{relatedError}</p>
              )}
            </div>

            {/* سایدبار (تبلیغات) */}
            {(sidebarAds.length > 0 || ykSidebar.length > 0) && (
              <aside className="space-y-4 min-w-0 hidden lg:block">
                {ykSidebar.map((p) => (
                  <AdSnippet key={p.key} html={p.html_code} className="yk-slot yk-slot-sidebar" />
                ))}
                {sidebarAds.map((ad) => (
                  <AdSnippet
                    key={ad.id}
                    html={ad.html_snippet}
                    className="sponsor-box sponsor-box-text sponsor-box-sidebar"
                  />
                ))}
              </aside>
            )}
          </div>
        </div>
      </div>
    </>
  );
}