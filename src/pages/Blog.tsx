import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogService, blogAdsService, type BlogPost, type BlogAd } from '../services/blogService';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featured, setFeatured] = useState<BlogPost | null>(null);
  const [ads, setAds] = useState<BlogAd[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [allPosts, featuredPost, activeAds] = await Promise.all([
          blogService.getPublishedPosts({ lang: 'fa' }),
          blogService.getFeaturedPost(),
          blogAdsService.getActiveAds(),
        ]);
        setPosts(allPosts);
        setFeatured(featuredPost);
        setAds(activeAds);
      } catch (err: any) {
        console.error('Error loading blog data', err);
        setError(err.message || 'خطا در بارگذاری بلاگ');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      (p.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts;
    return posts.filter((p) => (p.tags || []).includes(selectedTag));
  }, [posts, selectedTag]);

  const heroAds = ads.filter((a) => a.position === 'hero' || a.position === 'special');

  return (
    <>
      <Helmet>
        <title>بلاگ اکتیو لجند | Active Legend Blog</title>
        <meta
          name="description"
          content="آخرین مقالات، اخبار و devlogهای استودیو بازی‌سازی اکتیو لجند (Active Legend). آموزش ساخت بازی، معرفی بازی‌ها و تکنولوژی‌های مورد استفاده."
        />
        <link rel="canonical" href="https://activelegend.ir/blog" />
        <meta property="og:title" content="بلاگ اکتیو لجند | Active Legend Blog" />
        <meta
          property="og:description"
          content="مقالات و نوشته‌های تیم اکتیو لجند درباره بازی‌ها، توسعه بازی و اخبار استودیو."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://activelegend.ir/blog" />
        <meta property="og:image" content="https://activelegend.ir/AE%20logo.svg" />
      </Helmet>
      <div className="min-h-screen bg-black pt-20 md:pt-24 pb-12 md:pb-16 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-8 md:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-white mb-2 md:mb-3">
              بلاگ اکتیو لجند
            </h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-2xl text-right">
              مقالات، devlogها و آموزش‌های استودیو بازی‌سازی اکتیو لجند (Active Legend) درباره
              بازی‌ها، تکنولوژی و دنیای گیم.
            </p>
          </header>

          {loading && (
            <div className="text-center text-gray-300 py-10">در حال بارگذاری...</div>
          )}
          {error && !loading && (
            <div className="text-center text-red-400 py-4">{error}</div>
          )}

          {!loading && !error && (
            <>
              {/* Featured + hero ads */}
              {(featured || heroAds.length > 0) && (
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 md:mb-10">
                  <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg min-w-0">
                    <h2 className="text-lg font-bold text-primary mb-3">پست ویژه</h2>
                    {featured ? (
                      <Link to={`/blog/${featured.slug}`}>
                        <div className="flex flex-col md:flex-row gap-4">
                          {featured.cover_image_url && (
                            <img
                              src={featured.cover_image_url}
                              alt={featured.title}
                              className="w-full md:w-48 h-40 object-cover rounded-xl"
                            />
                          )}
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                              {featured.title}
                            </h3>
                            <p className="text-gray-300 text-sm md:text-base mb-2">
                              {featured.excerpt}
                            </p>
                            <span className="text-primary text-sm font-semibold">
                              ادامه مطلب →
                            </span>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <p className="text-gray-400 text-sm">هنوز پست ویژه‌ای تنظیم نشده است.</p>
                    )}
                  </div>
                  <aside className="space-y-4 min-w-0">
                    {heroAds.map((ad) => (
                      <div
                        key={ad.id}
                        className="ad-container ad-container-text"
                        dangerouslySetInnerHTML={{ __html: ad.html_snippet }}
                      />
                    ))}
                  </aside>
                </section>
              )}

              {/* Tags filter */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1 rounded-full text-xs md:text-sm border ${
                      !selectedTag
                        ? 'bg-primary text-black border-primary'
                        : 'bg-transparent text-gray-300 border-white/20'
                    }`}
                  >
                    همه تگ‌ها
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs md:text-sm border ${
                        selectedTag === tag
                          ? 'bg-primary text-black border-primary'
                          : 'bg-transparent text-gray-300 border-white/20'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Posts list */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col min-w-0 overflow-hidden"
                  >
                    <Link to={`/blog/${post.slug}`}>
                      {post.cover_image_url && (
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-44 md:h-48 object-cover rounded-xl mb-3"
                        />
                      )}
                      <h2 className="text-lg md:text-xl font-bold text-white mb-2">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-sm text-gray-300 mb-3 line-clamp-3">{post.excerpt}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {(post.tags || []).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-gray-200 border border-white/10"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-primary text-xs font-semibold hover:underline"
                      >
                        ادامه مطلب
                      </Link>
                    </div>
                  </article>
                ))}
                {!filteredPosts.length && (
                  <p className="text-gray-400 text-sm col-span-full">
                    هنوز پستی برای این تگ ثبت نشده است.
                  </p>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}

