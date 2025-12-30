import type { BookContents } from 'ketab-online-sdk';
import { getBookContents } from 'ketab-online-sdk';
import { useEffect, useState } from 'preact/hooks';
import { BookLoader } from './components/BookLoader';
import { BookViewer } from './components/BookViewer';
import './app.css';

// Helper to get book ID from URL search params
const getBookIdFromUrl = (): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get('book');
};

// Helper to update URL search params
const updateUrlWithBookId = (bookId: string | null) => {
    const url = new URL(window.location.href);
    if (bookId) {
        url.searchParams.set('book', bookId);
    } else {
        url.searchParams.delete('book');
    }
    window.history.pushState({}, '', url.toString());
};

export function App() {
    const [book, setBook] = useState<BookContents | null>(null);
    const [bookId, setBookId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load book from URL on initial mount
    useEffect(() => {
        const urlBookId = getBookIdFromUrl();
        if (urlBookId) {
            loadBook(urlBookId);
        }
    }, []);

    const loadBook = async (id: string) => {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            setError('Invalid book ID');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const bookData = await getBookContents(numericId);
            setBook(bookData);
            setBookId(id);
            updateUrlWithBookId(id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load book');
        } finally {
            setLoading(false);
        }
    };

    const handleBookLoaded = (loadedBook: BookContents, id: string) => {
        setBook(loadedBook);
        setBookId(id);
        updateUrlWithBookId(id);
    };

    const handleReset = () => {
        setBook(null);
        setBookId('');
        setError(null);
        updateUrlWithBookId(null);
    };

    return (
        <div class="app">
            <header>
                <h1>📚 Ketab Online SDK v1.4.0</h1>
                {book && (
                    <button class="reset-btn" onClick={handleReset}>
                        ← Load Different Book
                    </button>
                )}
            </header>

            <main>
                {loading ? (
                    <div class="welcome">
                        <p>Loading book {getBookIdFromUrl()}...</p>
                    </div>
                ) : !book ? (
                    <div class="welcome">
                        <p>
                            Enter a book ID from ketabonline.com to preview its content and test the markdown
                            converters.
                        </p>
                        <BookLoader onBookLoaded={handleBookLoaded} initialBookId={getBookIdFromUrl() || ''} />
                        {error && <div class="error">{error}</div>}
                    </div>
                ) : (
                    <BookViewer book={book} bookId={bookId} />
                )}
            </main>

            <footer>
                <p>
                    Powered by{' '}
                    <a href="https://github.com/ragaeeb/ketab-online-sdk" target="_blank" rel="noopener">
                        ketab-online-sdk
                    </a>
                </p>
            </footer>
        </div>
    );
}
