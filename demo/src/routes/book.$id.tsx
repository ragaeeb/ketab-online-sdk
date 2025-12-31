import { createFileRoute, Link } from '@tanstack/react-router';
import type { BookContents, Page } from 'ketab-online-sdk';
import { htmlToMarkdown } from 'ketab-online-sdk';
import { useState } from 'react';
import { fetchBookContents } from '../server/api';

export const Route = createFileRoute('/book/$id')({
    component: BookPage,
    loader: ({ params }) => fetchBookContents({ data: Number(params.id) }),
});

function BookPage() {
    const book = Route.useLoaderData() as BookContents;
    const [activeTab, setActiveTab] = useState<'pages' | 'index'>('pages');

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2 text-right" dir="rtl">
                        {book.title}
                    </h1>
                    <div className="flex items-center gap-4 flex-wrap">
                        {book.authors?.[0] && (
                            <Link
                                to="/author/$id"
                                params={{ id: String(book.authors[0].id) }}
                                className="text-cyan-400 hover:underline"
                            >
                                ✍️ {book.authors[0].name}
                            </Link>
                        )}
                        <Link to="/books" className="text-gray-400 hover:text-white text-sm">
                            ← Back to Books
                        </Link>
                    </div>
                </div>

                <div className="mb-4 text-gray-400 text-sm">
                    {book.pages?.length || 0} pages • {book.index?.length || 0} index entries
                </div>

                <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('pages')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'pages' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Pages ({book.pages?.length || 0})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('index')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'index' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Index ({book.index?.length || 0})
                    </button>
                </div>

                {activeTab === 'pages' ? (
                    <div className="space-y-6">
                        {book.pages?.map((page) => (
                            <PageCard key={page.id} page={page} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6" dir="rtl">
                        {book.index?.map((item) => (
                            <div key={item.id} className="py-2 border-b border-slate-700 last:border-0">
                                <span className="text-white">{item.title}</span>
                                <span className="text-gray-500 text-sm mr-2">صفحة {item.page}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PageCard({ page }: { page: Page }) {
    const [view, setView] = useState<'html' | 'markdown'>('html');

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                <span className="text-cyan-400 font-medium">
                    صفحة {page.page} <span className="text-gray-500 text-sm">({page.id})</span>
                </span>
                <div className="flex gap-1 bg-slate-700 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => setView('html')}
                        className={`px-3 py-1 text-sm rounded ${view === 'html' ? 'bg-cyan-600 text-white' : 'text-gray-400'}`}
                    >
                        HTML
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('markdown')}
                        className={`px-3 py-1 text-sm rounded ${view === 'markdown' ? 'bg-cyan-600 text-white' : 'text-gray-400'}`}
                    >
                        Markdown
                    </button>
                </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto text-right" dir="rtl">
                {view === 'html' ? (
                    <div className="text-gray-200 leading-loose" dangerouslySetInnerHTML={{ __html: page.content }} />
                ) : (
                    <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm bg-slate-900 p-4 rounded-lg">
                        {htmlToMarkdown(page.content)}
                    </pre>
                )}
            </div>
        </div>
    );
}
