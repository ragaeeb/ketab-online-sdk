import type { IndexItem } from 'ketab-online-sdk';
import { indexToMarkdown } from 'ketab-online-sdk';
import { useState } from 'preact/hooks';

interface IndexTreeProps {
    index: IndexItem[];
}

function IndexNode({ item, depth = 0 }: { item: IndexItem; depth?: number }) {
    const [expanded, setExpanded] = useState(depth < 2);
    const hasChildren = item.children && item.children.length > 0;

    return (
        <div class="index-node" style={{ paddingLeft: `${depth * 16}px` }}>
            <div class="index-item" onClick={() => hasChildren && setExpanded(!expanded)}>
                {hasChildren && <span class="expand-icon">{expanded ? '▼' : '▶'}</span>}
                <span class="index-title">{item.title}</span>
                <span class="index-page">p. {item.page}</span>
            </div>
            {hasChildren && expanded && (
                <div class="index-children">
                    {item.children!.map((child: IndexItem) => (
                        <IndexNode key={child.id} item={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function IndexTree({ index }: IndexTreeProps) {
    const [showMarkdown, setShowMarkdown] = useState(false);

    if (index.length === 0) {
        return <div class="empty-state">No index available</div>;
    }

    return (
        <div class="index-tree">
            <div class="index-header">
                <h3>Table of Contents</h3>
                <button onClick={() => setShowMarkdown(!showMarkdown)}>
                    {showMarkdown ? 'Show Tree' : 'Show Markdown'}
                </button>
            </div>
            {showMarkdown ? (
                <pre class="index-markdown">{indexToMarkdown(index)}</pre>
            ) : (
                <div class="index-nodes">
                    {index.map((item) => (
                        <IndexNode key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
