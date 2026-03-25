import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogApi, BlogPost } from '../services/api';
import { Seo } from '../components/Seo';
import { Footer } from '../components/common/Footer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Pagination } from '../components/common/Pagination';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { normalizeArray } from '../utils/arrayUtils';

const BLOG_PAGE_SIZE = 6;

export function BlogListPage() {
  const { siteSettings } = useSiteSettings();

  const [page, setPage] = useState(1);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = BLOG_PAGE_SIZE > 0 ? Math.ceil(totalCount / BLOG_PAGE_SIZE) : 0;

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await blogApi.getAll({
          page,
          page_size: BLOG_PAGE_SIZE,
          ordering: '-published_at',
        });

        if (response?.results) {
          setBlogs(response.results as BlogPost[]);
          setTotalCount(response.count || 0);
        } else {
          const list = normalizeArray<BlogPost>(response);
          setBlogs(list);
          setTotalCount(list.length);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load blogs');
        setBlogs([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Seo
        title={`Blogs | ${siteSettings.brand_name}`}
        description={siteSettings.description}
        path="/blog"
        siteName={siteSettings.brand_name}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 pb-10">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Blogs</h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Latest guides, reviews, and verdicts from {siteSettings.brand_name}.
          </p>
        </header>

        {loading ? (
          <LoadingSpinner message="Loading guides..." />
        ) : error ? (
          <ErrorMessage title="Blogs" message={error} className="pt-10" />
        ) : blogs.length > 0 ? (
          <>
            <div className="space-y-4">
              {blogs.map((b) => (
                <Link key={b.slug} to={`/blog/${b.slug}`} className="block">
                  <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-5 hover:border-cyan-500/40 transition-all">
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        {b.cover_image ? (
                          <img
                            src={b.cover_image}
                            alt={b.title}
                            loading="lazy"
                            decoding="async"
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium line-clamp-2">{b.title}</p>
                        {b.excerpt ? (
                          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{b.excerpt}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-center py-10">No blog posts found.</p>
        )}
      </main>

      <Footer />
    </div>
  );
}

