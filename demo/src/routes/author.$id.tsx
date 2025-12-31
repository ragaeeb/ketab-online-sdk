import { createFileRoute, Link } from '@tanstack/react-router';
import type { AuthorInfo } from 'ketab-online-sdk';
import { fetchAuthorInfo } from '../server/api';

export const Route = createFileRoute('/author/$id')({
    component: AuthorPage,
    loader: ({ params }) => fetchAuthorInfo({ data: Number(params.id) }),
});

function AuthorPage() {
    const author = Route.useLoaderData() as AuthorInfo;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-6">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">✍️ {author.name}</h1>
                    {author.long_name && author.long_name !== author.name && (
                        <p className="text-gray-400">{author.long_name}</p>
                    )}
                </div>

                <div className="flex justify-center gap-8 mb-8">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-cyan-400">{author.books_count}</div>
                        <div className="text-gray-400">Books</div>
                    </div>
                </div>

                {author.resume && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
                        <h2 className="text-xl font-semibold text-white mb-4">Biography</h2>
                        <p className="text-gray-400 leading-relaxed">{author.resume}</p>
                    </div>
                )}

                <div className="text-center">
                    <Link
                        to="/books"
                        search={{ author: author.id }}
                        className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30"
                    >
                        View All Books ({author.books_count})
                    </Link>
                </div>

                <div className="text-center mt-6">
                    <Link to="/books" className="text-gray-400 hover:text-white text-sm">
                        ← Back to Books
                    </Link>
                </div>
            </div>
        </div>
    );
}
