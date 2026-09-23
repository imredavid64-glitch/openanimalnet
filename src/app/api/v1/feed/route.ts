import { NextResponse } from 'next/server';
import { sampleAlerts } from '@/data/sample/alerts';

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function generateAtomFeed(): string {
  const now = new Date().toISOString();
  const entries = sampleAlerts.slice(0, 20).map(alert => {
    const animal = alert.animal;
    const title = `${alert.type.toUpperCase()}: ${animal?.commonName ?? 'Unknown'} — ${alert.message}`;
    const link = `https://openanimalnet.vercel.app/monitor/alerts/${alert.id}`;
    return `
    <entry>
      <title>${escapeXml(title)}</title>
      <link rel="alternate" href="${link}"/>
      <id>urn:oan:alert:${alert.id}</id>
      <updated>${alert.timestamp ?? now}</updated>
      <summary>${escapeXml(alert.message)}</summary>
      <category term="${alert.type}"/>
      ${animal ? `<category term="${escapeXml(animal.category)}"/>` : ''}
    </entry>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>OpenAnimalNet — Conservation Alerts</title>
  <link rel="self" href="https://openanimalnet.vercel.app/api/v1/feed"/>
  <id>urn:oan:feed:alerts</id>
  <updated>${now}</updated>
  <subtitle>Real-time conservation alerts for tracked species</subtitle>
  <author>
    <name>OpenAnimalNet</name>
  </author>${entries}
</feed>`;
}

function generateRSSFeed(): string {
  const now = new Date().toUTCString();
  const items = sampleAlerts.slice(0, 20).map(alert => {
    const animal = alert.animal;
    const title = `${alert.type.toUpperCase()}: ${animal?.commonName ?? 'Unknown'} — ${alert.message}`;
    const link = `https://openanimalnet.vercel.app/monitor/alerts/${alert.id}`;
    return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">urn:oan:alert:${alert.id}</guid>
      <pubDate>${alert.timestamp ? new Date(alert.timestamp).toUTCString() : now}</pubDate>
      <description>${escapeXml(alert.message)}</description>
      <category>${alert.type}</category>
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>OpenAnimalNet — Conservation Alerts</title>
    <link>https://openanimalnet.vercel.app</link>
    <description>Real-time conservation alerts for tracked species</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>${items}
  </channel>
</rss>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') ?? 'atom';

  const body = format === 'rss' ? generateRSSFeed() : generateAtomFeed();
  const contentType = format === 'rss' ? 'application/rss+xml' : 'application/atom+xml';

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}