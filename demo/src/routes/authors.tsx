import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { type AuthorInfo, stripHtmlTags } from 'ketab-online-sdk';
import { useEffect, useState } from 'react';
import { fetchAuthors } from '../server/api';

type AuthorsSearch = {
    q?: string;
};

export const Route = createFileRoute('/authors')({
    component: AuthorsPage,
    loader: ({ deps }) => {
        const { search } = deps as { search: AuthorsSearch };
        return fetchAuthors({ data: { limit: 30, page: 1, query: search.q } });
    },
    loaderDeps: ({ search }): { search: AuthorsSearch } => ({ search }),
    validateSearch: (search: Record<string, unknown>): AuthorsSearch => ({
        q: search.q as string | undefined,
    }),
});

function AuthorsPage() {
    const initialData = Route.useLoaderData() as {
        data: AuthorInfo[];
        hasMore: boolean;
    };
    const search = Route.useSearch();
    const navigate = useNavigate();

    const [allAuthors, setAllAuthors] = useState<AuthorInfo[]>(initialData.data);
    const [page, setPage] = useState(1);
    const [canLoadMore, setCanLoadMore] = useState(initialData.hasMore);
    const [loading, setLoading] = useState(false);

    // Reset when search changes
    useEffect(() => {
        setAllAuthors(initialData.data);
        setPage(1);
        setCanLoadMore(initialData.hasMore);
    }, [initialData.data, initialData.hasMore]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.querySelector('input') as HTMLInputElement;
        const query = input.value.trim();
        navigate({ search: query ? { q: query } : {}, to: '/authors' });
    };

    const handleLoadMore = async () => {
        setLoading(true);
        try {
            const nextPage = page + 1;
            const result = await fetchAuthors({ data: { limit: 30, page: nextPage, query: search.q } });
            setAllAuthors((prev) => [...prev, ...result.data]);
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
                        <h1 className="text-3xl font-bold text-white mb-2">✍️ Browse Authors</h1>
                        <Link to="/" className="text-cyan-400 hover:underline text-sm">
                            ← Back to Categories
                        </Link>
                    </div>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            name="q"
                            placeholder="Search authors..."
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
                        <Link to="/authors" className="text-cyan-400 hover:underline text-sm">
                            Clear
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allAuthors.map((author) => (
                        <Link
                            key={author.id}
                            to="/author/$id"
                            params={{ id: String(author.id) }}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300"
                        >
                            <h3 className="text-lg font-semibold text-white mb-2">{stripHtmlTags(author.name || '')}</h3>
                            {author.long_name && author.long_name !== author.name && (
                                <p className="text-gray-500 text-sm mb-2 line-clamp-1">{stripHtmlTags(author.long_name)}</p>
                            )}
                            <div className="text-cyan-400 text-sm">{author.books_count} books</div>
                        </Link>
                    ))}
                </div>

                {allAuthors.length === 0 && <div className="text-center py-12 text-gray-400">No authors found</div>}

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
