import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { type CategoryInfo, stripHtmlTags } from 'ketab-online-sdk';
import { useEffect, useState } from 'react';
import { fetchCategories } from '../server/api';

type CategoriesSearch = {
    q?: string;
};

export const Route = createFileRoute('/')({
    component: HomePage,
    loader: ({ deps }) => {
        const { search } = deps as { search: CategoriesSearch };
        return fetchCategories({ data: { limit: 30, page: 1, query: search.q } });
    },
    loaderDeps: ({ search }): { search: CategoriesSearch } => ({ search }),
    validateSearch: (search: Record<string, unknown>): CategoriesSearch => ({
        q: search.q as string | undefined,
    }),
});

function HomePage() {
    const initialData = Route.useLoaderData() as {
        data: CategoryInfo[];
        hasMore: boolean;
    };
    const search = Route.useSearch();
    const navigate = useNavigate();

    const [allCategories, setAllCategories] = useState<CategoryInfo[]>(initialData.data);
    const [page, setPage] = useState(1);
    const [canLoadMore, setCanLoadMore] = useState(initialData.hasMore);
    const [loading, setLoading] = useState(false);

    // Reset when search changes
    useEffect(() => {
        setAllCategories(initialData.data);
        setPage(1);
        setCanLoadMore(initialData.hasMore);
    }, [initialData.data, initialData.hasMore]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.querySelector('input') as HTMLInputElement;
        const query = input.value.trim();
        navigate({ search: query ? { q: query } : {}, to: '/' });
    };

    const handleLoadMore = async () => {
        setLoading(true);
        try {
            const nextPage = page + 1;
            const result = await fetchCategories({ data: { limit: 30, page: nextPage, query: search.q } });
            setAllCategories((prev) => [...prev, ...result.data]);
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
                        <h1 className="text-3xl font-bold text-white mb-2">📚 Browse Categories</h1>
                        <p className="text-gray-400">Explore Islamic books from ketabonline.com</p>
                    </div>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            name="q"
                            placeholder="Search categories..."
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
                        <Link to="/" className="text-cyan-400 hover:underline text-sm">
                            Clear
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allCategories.map((category) => (
                        <Link
                            key={category.id}
                            to="/books"
                            search={{ category: category.id }}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                                📁
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{stripHtmlTags(category.name || '')}</h3>
                                <span className="text-gray-400 text-sm">{category.books_count} books</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {allCategories.length === 0 && (
                    <div className="text-center py-12 text-gray-400">No categories found</div>
                )}

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
