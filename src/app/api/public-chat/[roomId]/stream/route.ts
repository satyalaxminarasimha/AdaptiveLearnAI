import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PublicChat from '@/models/PublicChat';
import { verifyToken } from '@/lib/auth';
import {
  subscribeRoom,
  unsubscribeRoom,
  publishRoomHeartbeat,
} from '@/lib/public-chat-events';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const payload = verifyToken(request);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await dbConnect();
  const { roomId } = await params;

  const exists = await PublicChat.exists({ _id: roomId, isActive: true });
  if (!exists) {
    return new Response(JSON.stringify({ error: 'Chat room not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const connectedFrame = new TextEncoder().encode(`data: ${JSON.stringify({ type: 'connected', roomId })}\n\n`);
      controller.enqueue(connectedFrame);
      subscribeRoom(roomId, controller);

      const heartbeat = setInterval(() => {
        publishRoomHeartbeat(roomId);
      }, 25000);

      const close = () => {
        clearInterval(heartbeat);
        unsubscribeRoom(roomId, controller);
        try {
          controller.close();
        } catch {
          // no-op
        }
      };

      request.signal.addEventListener('abort', close, { once: true });
    },
    cancel() {
      // listener cleanup happens on abort
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
