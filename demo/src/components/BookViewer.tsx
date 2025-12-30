import type { BookContents } from 'ketab-online-sdk';
import { useEffect, useState } from 'preact/hooks';
import { IndexTree } from './IndexTree';
import { PageCard } from './PageCard';

interface BookViewerProps {
    book: BookContents;
    bookId: string;
}

// Get page ID from URL hash (e.g., #page-12345)
const getPageIdFromHash = (): number | null => {
    const hash = window.location.hash;
    const match = hash.match(/^#page-(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
};

export function BookViewer({ book, bookId }: BookViewerProps) {
    const [activeTab, setActiveTab] = useState<'pages' | 'index'>('pages');

    const totalPages = book.pages.length;

    // Scroll to page from URL hash after component mounts
    useEffect(() => {
        const pageId = getPageIdFromHash();
        if (pageId) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                const element = document.getElementById(`page-${pageId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Highlight the targeted page briefly
                    element.classList.add('highlighted');
                    setTimeout(() => element.classList.remove('highlighted'), 2000);
                }
            }, 100);
        }
    }, [book]);

    return (
        <div class="book-viewer">
            <div class="book-info">
                <h2>Book ID: {bookId}</h2>
                <p>
                    {totalPages} pages • {book.index.length} index entries
                    <span class="hash-hint"> · Use #page-ID in URL to jump to a page</span>
                </p>
            </div>

            <div class="tabs">
                <button class={activeTab === 'pages' ? 'active' : ''} onClick={() => setActiveTab('pages')}>
                    Pages ({totalPages})
                </button>
                <button class={activeTab === 'index' ? 'active' : ''} onClick={() => setActiveTab('index')}>
                    Index ({book.index.length})
                </button>
            </div>

            <div class="tab-content">
                {activeTab === 'pages' ? (
                    <div class="pages-list">
                        {book.pages.map((page) => (
                            <PageCard key={page.id} page={page} />
                        ))}
                    </div>
                ) : (
                    <IndexTree index={book.index} />
                )}
            </div>
        </div>
    );
}
