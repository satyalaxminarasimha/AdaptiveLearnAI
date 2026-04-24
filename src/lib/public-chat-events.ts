type StreamController = ReadableStreamDefaultController<Uint8Array>;

type ListenerSet = Set<StreamController>;

const encoder = new TextEncoder();
const roomListeners = new Map<string, ListenerSet>();

function toSseFrame(data: unknown, event?: string) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  if (!event) {
    return encoder.encode(payload);
  }

  return encoder.encode(`event: ${event}\n${payload}`);
}

export function subscribeRoom(roomId: string, controller: StreamController) {
  let listeners = roomListeners.get(roomId);
  if (!listeners) {
    listeners = new Set();
    roomListeners.set(roomId, listeners);
  }
  listeners.add(controller);
}

export function unsubscribeRoom(roomId: string, controller: StreamController) {
  const listeners = roomListeners.get(roomId);
  if (!listeners) {
    return;
  }

  listeners.delete(controller);
  if (listeners.size === 0) {
    roomListeners.delete(roomId);
  }
}

export function publishRoomMessage(roomId: string, data: unknown) {
  const listeners = roomListeners.get(roomId);
  if (!listeners || listeners.size === 0) {
    return;
  }

  const frame = toSseFrame(data);
  for (const controller of listeners) {
    try {
      controller.enqueue(frame);
    } catch {
      listeners.delete(controller);
    }
  }

  if (listeners.size === 0) {
    roomListeners.delete(roomId);
  }
}

export function publishRoomHeartbeat(roomId: string) {
  const listeners = roomListeners.get(roomId);
  if (!listeners || listeners.size === 0) {
    return;
  }

  const frame = toSseFrame({ ts: Date.now() }, 'ping');
  for (const controller of listeners) {
    try {
      controller.enqueue(frame);
    } catch {
      listeners.delete(controller);
    }
  }

  if (listeners.size === 0) {
    roomListeners.delete(roomId);
  }
}
