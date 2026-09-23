import { NextResponse } from 'next/server';
import { addListener, removeListener } from '@/lib/liveHub';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  let cancelled = false;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: { type: string; data: unknown }) => {
        if (cancelled) return;
        const payload = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
        try { controller.enqueue(encoder.encode(payload)); } catch {}
      };

      // Send initial connection confirmation
      send({ type: 'connected', data: { timestamp: new Date().toISOString(), message: 'Connected to OpenAnimalNet live feed' } });

      // Register listener
      addListener(send);

      // Heartbeat every 30s
      const heartbeat = setInterval(() => {
        if (cancelled) { clearInterval(heartbeat); return; }
        send({ type: 'heartbeat', data: { timestamp: new Date().toISOString() } });
      }, 30000);

      // Demo: simulate alert activity every 15s
      const demoInterval = setInterval(() => {
        if (cancelled) { clearInterval(demoInterval); return; }
        const types = ['critical', 'warning', 'info'] as const;
        const messages = [
          'Population count updated',
          'New observation recorded',
          'Habitat change detected',
          'Migration corridor active',
          'Conservation status reviewed',
        ];
        send({
          type: 'alert',
          data: {
            id: `demo-${Date.now()}`,
            type: types[Math.floor(Math.random() * types.length)],
            message: messages[Math.floor(Math.random() * messages.length)],
            timestamp: new Date().toISOString(),
            animalId: ['lion-001', 'elephant-001', 'tiger-001', 'polar-bear-001'][Math.floor(Math.random() * 4)],
          },
        });
      }, 15000);

      const cleanup = () => {
        cancelled = true;
        removeListener(send);
        clearInterval(heartbeat);
        clearInterval(demoInterval);
        try { controller.close(); } catch {}
      };

      const checkAbort = setInterval(() => {
        if (cancelled) { clearInterval(checkAbort); }
      }, 1000);

      // Auto-cleanup after 5 minutes
      setTimeout(cleanup, 300000);
    },
    cancel() {
      cancelled = true;
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}