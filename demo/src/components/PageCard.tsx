import type { Page } from 'ketab-online-sdk';
import { htmlToMarkdown, pageToMarkdownWithFootnotes, splitPageFootnotes } from 'ketab-online-sdk';
import { useState } from 'preact/hooks';

interface PageCardProps {
    page: Page;
}

export function PageCard({ page }: PageCardProps) {
    const [viewMode, setViewMode] = useState<'html' | 'markdown' | 'footnotes'>('html');

    const [bodyHtml] = splitPageFootnotes(page.content);

    const getContent = () => {
        switch (viewMode) {
            case 'markdown':
                return htmlToMarkdown(bodyHtml);
            case 'footnotes':
                return pageToMarkdownWithFootnotes(page.content);
            default:
                return page.content;
        }
    };

    return (
        <div class="page-card" id={`page-${page.id}`}>
            <div class="page-header">
                <span class="page-number">
                    Page {page.page}
                    {page.part && ` (Part ${page.part.name})`}
                    <span class="page-id"> · ID: {page.id}</span>
                </span>
                <div class="view-toggle">
                    <button class={viewMode === 'html' ? 'active' : ''} onClick={() => setViewMode('html')}>
                        HTML
                    </button>
                    <button class={viewMode === 'markdown' ? 'active' : ''} onClick={() => setViewMode('markdown')}>
                        Markdown
                    </button>
                    <button class={viewMode === 'footnotes' ? 'active' : ''} onClick={() => setViewMode('footnotes')}>
                        With Footnotes
                    </button>
                </div>
            </div>
            <div class={`page-content ${viewMode === 'html' ? 'html-view' : 'text-view'}`}>
                {viewMode === 'html' ? (
                    <div dangerouslySetInnerHTML={{ __html: page.content }} />
                ) : (
                    <pre>{getContent()}</pre>
                )}
            </div>
        </div>
    );
}
