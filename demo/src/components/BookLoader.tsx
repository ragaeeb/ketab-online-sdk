import type { BookContents } from 'ketab-online-sdk';
import { getBookContents } from 'ketab-online-sdk';
import { useState } from 'preact/hooks';

interface BookLoaderProps {
    onBookLoaded: (book: BookContents, bookId: string) => void;
    initialBookId?: string;
}

export function BookLoader({ onBookLoaded, initialBookId = '' }: BookLoaderProps) {
    const [bookId, setBookId] = useState(initialBookId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!bookId.trim()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const id = parseInt(bookId.trim(), 10);
            if (isNaN(id)) {
                setError('Please enter a valid numeric book ID');
                return;
            }
            const book = await getBookContents(id);
            // Update URL with book ID
            const url = new URL(window.location.href);
            url.searchParams.set('book', bookId.trim());
            window.history.pushState({}, '', url.toString());

            onBookLoaded(book, bookId.trim());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form class="book-loader" onSubmit={handleSubmit}>
            <div class="input-group">
                <input
                    type="text"
                    value={bookId}
                    onInput={(e) => setBookId((e.target as HTMLInputElement).value)}
                    placeholder="Enter book ID (e.g., 14970)"
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !bookId.trim()}>
                    {loading ? 'Loading...' : 'Load Book'}
                </button>
            </div>
            {error && <div class="error">{error}</div>}
        </form>
    );
}
