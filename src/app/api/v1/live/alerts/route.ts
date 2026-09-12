import { NextResponse } from 'next/server';
import { sampleAlerts } from '@/data/sample/alerts';
import { applyRateLimit } from '@/lib/apiRateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

/**
 * GET /api/v1/live/alerts
 * Server-Sent Events (SSE) endpoint for real-time monitoring alerts.
 * 
 * Client usage:
 *   const evtSource = new EventSource('/api/v1/live/alerts');
 *   evtSource.onmessage = (e) => { const alert = JSON.parse(e.data); ... };
 * 
 * Query params:
 *   - types: comma-separated alert types (critical,warning,info)
 *   - species: comma-separated animal IDs to filter
 *   - heartbeat: interval in ms for keep-alive (default 30000)
 */
export async function GET(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const typesParam = searchParams.get('types') ?? 'critical,warning,info';
  const speciesParam = searchParams.get('species') ?? '';
  const heartbeat = parseInt(searchParams.get('heartbeat') ?? '30000', 10);

  const allowedTypes = typesParam.split(',').map(t => t.trim()).filter(Boolean);
  const allowedSpecies = speciesParam.split(',').map(s => s.trim()).filter(Boolean);

  // Filter alerts based on query params
  let filteredAlerts = sampleAlerts.filter(a => allowedTypes.includes(a.type));
  if (allowedSpecies.length > 0) {
    filteredAlerts = filteredAlerts.filter(a => allowedSpecies.includes(a.animal.id));
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial alert snapshot
      const initialData = {
        type: 'snapshot',
        timestamp: Date.now(),
        alerts: filteredAlerts,
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));

      // Heartbeat interval
      const heartbeatInterval = setInterval(() => {
        if (closed) {
          clearInterval(heartbeatInterval);
          return;
        }
        controller.enqueue(encoder.encode(`: heartbeat\n\n`));
      }, heartbeat);

      // Simulate real-time alert updates (in production, this would come from a message queue)
      // For demo, we'll randomly add/update alerts every 10-30 seconds
      const updateInterval = setInterval(() => {
        if (closed) {
          clearInterval(updateInterval);
          return;
        }
        // 10% chance of a new alert
        if (Math.random() < 0.1) {
          const alertTypes = ['critical', 'warning', 'info'] as const;
          const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
          const animals = ['lion-001', 'elephant-001', 'tiger-001', 'gorilla-001', 'penguin-001'];
          const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
          
          const newAlert = {
            id: `alert-${Date.now()}`,
            type: randomType,
            animal: { id: randomAnimal },
            message: `${randomType.toUpperCase()}: New activity detected for ${randomAnimal}`,
            timestamp: new Date().toISOString(),
            location: { lat: 0, lng: 0 },
            severity: randomType === 'critical' ? 9 : randomType === 'warning' ? 6 : 3,
          };
          
          const updateData = {
            type: 'alert',
            action: 'add',
            timestamp: Date.now(),
            alert: newAlert,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(updateData)}\n\n`));
        }
      }, 15000);

      // Cleanup on close
      return () => {
        closed = true;
        clearInterval(heartbeatInterval);
        clearInterval(updateInterval);
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}