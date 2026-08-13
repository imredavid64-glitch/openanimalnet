import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenAnimalNet - Global Animal Data Platform',
  description: 'Monitor, analyze, and explore comprehensive animal data from around the world. Track biological, behavioral, ecological, and conservation data for all species.',
  keywords: ['animals', 'wildlife', 'conservation', 'monitoring', 'biodiversity', 'ecology', 'zoology'],
  authors: [{ name: 'OpenAnimalNet Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://openanimalnet.org',
    siteName: 'OpenAnimalNet',
    title: 'OpenAnimalNet - Global Animal Data Platform',
    description: 'Monitor, analyze, and explore comprehensive animal data from around the world.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenAnimalNet - Global Animal Data Platform',
    description: 'Monitor, analyze, and explore comprehensive animal data from around the world.',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
