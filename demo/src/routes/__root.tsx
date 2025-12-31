import { createRootRoute, HeadContent, Link, Outlet, Scripts } from '@tanstack/react-router';
import Header from '../components/Header';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
    component: RootComponent,
    head: () => ({
        links: [
            { href: appCss, rel: 'stylesheet' },
            { href: '/icon.svg', rel: 'icon', type: 'image/svg+xml' },
        ],
        meta: [
            { charSet: 'utf-8' },
            { content: 'width=device-width, initial-scale=1', name: 'viewport' },
            { title: 'Ketab Online SDK Demo' },
        ],
    }),
    notFoundComponent: NotFound,
});

function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                <p className="text-gray-400 mb-6">Page not found</p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}

function RootComponent() {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <Header />
                <Outlet />
                <Scripts />
            </body>
        </html>
    );
}
