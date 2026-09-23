/**
 * Shared SSE broadcast hub for live alert streaming.
 * Route handlers and server code can import broadcastAlert to push events.
 */

type Listener = (event: { type: string; data: unknown }) => void;
const listeners = new Set<Listener>();

export function broadcastAlert(alert: unknown) {
  const event = { type: 'alert', data: alert };
  for (const listener of listeners) {
    listener(event);
  }
}

export function addListener(listener: Listener) {
  listeners.add(listener);
}

export function removeListener(listener: Listener) {
  listeners.delete(listener);
}