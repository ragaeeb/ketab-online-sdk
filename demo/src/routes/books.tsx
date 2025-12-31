import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { type BookInfo, stripHtmlTags } from 'ketab-online-sdk';
import { useEffect, useState } from 'react';
import { fetchAuthorInfo, fetchBooks, fetchCategoryInfo } from '../server/api';

type BooksSearch = {
    category?: number;
    author?: number;
    q?: string;
};

export const Route = createFileRoute('/books')({
    component: BooksPage,
    loader: async ({ deps }) => {
        const { search } = deps as { search: BooksSearch };
        const [booksResult, filterInfo] = await Promise.all([
            fetchBooks({
                data: { author_id: search.author, category_id: search.category, limit: 20, page: 1, query: search.q },
            }),
            search.category
                ? fetchCategoryInfo({ data: search.category }).then((cat) => ({
                      name: cat?.name || '',
                      type: 'Category',
                  }))
                : search.author
                  ? fetchAuthorInfo({ data: search.author }).then((author) => ({
                        name: author?.name || '',
                        type: 'Author',
                    }))
                  : null,
        ]);
        return { books: booksResult.data, filterInfo, hasMore: booksResult.hasMore };
    },
    loaderDeps: ({ search }): { search: BooksSearch } => ({ search }),
    validateSearch: (search: Record<string, unknown>): BooksSearch => ({
        author: search.author ? Number(search.author) : undefined,
        category: search.category ? Number(search.category) : undefined,
        q: search.q as string | undefined,
    }),
});

function BooksPage() {
    const initialData = Route.useLoaderData() as {
        books: BookInfo[];
        hasMore: boolean;
        filterInfo: { type: string; name: string } | null;
    };
    const search = Route.useSearch();
    const navigate = useNavigate();

    const [allBooks, setAllBooks] = useState<BookInfo[]>(initialData.books);
    const [page, setPage] = useState(1);
    const [canLoadMore, setCanLoadMore] = useState(initialData.hasMore);
    const [loading, setLoading] = useState(false);

    // Reset when search/filter changes
    useEffect(() => {
        setAllBooks(initialData.books);
        setPage(1);
        setCanLoadMore(initialData.hasMore);
    }, [initialData.books, initialData.hasMore]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.querySelector('input') as HTMLInputElement;
        const query = input.value.trim();
        navigate({
            search: {
                author: search.author,
                category: search.category,
                q: query || undefined,
            },
            to: '/books',
        });
    };

    const handleLoadMore = async () => {
        setLoading(true);
        try {
            const nextPage = page + 1;
            const result = await fetchBooks({
                data: {
                    author_id: search.author,
                    category_id: search.category,
                    limit: 20,
                    page: nextPage,
                    query: search.q,
                },
            });
            setAllBooks((prev) => [...prev, ...result.data]);
            setPage(nextPage);
            setCanLoadMore(result.hasMore);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {initialData.filterInfo
                                ? `${initialData.filterInfo.type}: ${stripHtmlTags(initialData.filterInfo.name)}`
                                : '📖 Browse Books'}
                        </h1>
                        <Link to="/" className="text-cyan-400 hover:underline text-sm">
                            ← Back to Categories
                        </Link>
                    </div>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            name="q"
                            placeholder="Search books..."
                            defaultValue={search.q || ''}
                            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none min-w-[250px]"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {search.q && (
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-gray-400">Results for "{search.q}"</span>
                        <Link
                            to="/books"
                            search={{ author: search.author, category: search.category }}
                            className="text-cyan-400 hover:underline text-sm"
                        >
                            Clear
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allBooks.map((book) => (
                        <div
                            key={book.id}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300"
                        >
                            <Link to="/book/$id" params={{ id: String(book.id) }}>
                                <h3 className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors mb-2 line-clamp-2">
                                    {stripHtmlTags(book.title || '')}
                                </h3>
                            </Link>
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                {book.authors?.[0] && (
                                    <Link
                                        to="/author/$id"
                                        params={{ id: String(book.authors[0].id) }}
                                        className="text-cyan-400 text-sm hover:underline"
                                    >
                                        ✍️ {stripHtmlTags(book.authors[0].name || '')}
                                    </Link>
                                )}
                                {book.categories?.[0] && (
                                    <span className="px-2 py-1 bg-slate-700 rounded-full text-xs text-gray-300">
                                        {stripHtmlTags(book.categories[0].name || '')}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                                {stripHtmlTags(book.description || '')}
                            </p>
                            <div className="flex gap-4 text-gray-500 text-xs">
                                <span>📖 {book.pages_count} pages</span>
                                <span>👁️ {book.views} views</span>
                            </div>
                        </div>
                    ))}
                </div>

                {allBooks.length === 0 && <div className="text-center py-12 text-gray-400">No books found</div>}

                {canLoadMore && (
                    <div className="text-center mt-8">
                        <button
                            type="button"
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
