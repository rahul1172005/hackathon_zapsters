import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Real-time client for live judging.
 *
 * Subscribes to the FastAPI realtime endpoints — `GET /api/v1/sse/{id}`
 * (Server-Sent Events, primary transport) or `WS /api/v1/ws/{id}` — and
 * delivers the same envelope the backend publishes:
 *
 * ```json
 * {
 *   "event_id": "uuid4",
 *   "type": "evaluation.submitted" | "evaluation.scored" | "submission.submitted",
 *   "hackathon_id": "...",
 *   "timestamp": "ISO-8601",
 *   "payload": { ... }
 * }
 * ```
 *
 * `useRealtime` is the React wrapper; `subscribeLiveJudging` returns a plain
 * cleanup handle for non-React call sites. SSE is used by default because it
 * flows through the Next.js `/api/*` rewrite as a normal HTTP GET.
 */

export type RealtimeTransport = 'sse' | 'ws';

export type RealtimeStatus = 'connecting' | 'open' | 'closed' | 'error';

export interface EvaluationScoredPayload {
  evaluation_id?: string;
  judge_id: string;
  judge_name?: string;
  team_id: string;
  team_name?: string;
  hackathon_id: string;
  scores: Record<string, number>;
  total_score: number;
  status?: string;
}

export interface SubmissionSubmittedPayload {
  submission_id: string;
  team_id: string;
  team_name?: string;
  hackathon_id: string;
  project_name: string;
  submitted_at?: string;
}

export interface RealtimeEventMap {
  'evaluation.submitted': EvaluationScoredPayload;
  'evaluation.scored': EvaluationScoredPayload;
  'submission.submitted': SubmissionSubmittedPayload;
  'realtime.connected': Record<string, never>;
  'realtime.ping': { at: string };
}

export type JudgingEventType = keyof RealtimeEventMap;

export interface RealtimeEvent<T extends JudgingEventType = JudgingEventType> {
  event_id: string;
  type: T;
  hackathon_id: string;
  timestamp: string;
  payload: RealtimeEventMap[T];
}

export interface RealtimeHandlers {
  onEvent: (event: RealtimeEvent) => void;
  onOpen?: () => void;
  onError?: () => void;
  onClose?: () => void;
}

export interface UseRealtimeOptions {
  transport?: RealtimeTransport;
  enabled?: boolean;
  onEvent?: (event: RealtimeEvent) => void;
  onStatusChange?: (status: RealtimeStatus) => void;
  /** Base delay (ms) for the exponential reconnect backoff of the WS transport. */
  reconnectDelayMs?: number;
  /** How many events to keep in the ring buffer returned by the hook. */
  maxEvents?: number;
}

export interface UseRealtimeResult {
  events: RealtimeEvent[];
  status: RealtimeStatus;
  error: string | null;
  isLive: boolean;
  latestEvent: RealtimeEvent | null;
}

const API_PREFIX = '/api/v1';

const EVENT_TYPES: readonly JudgingEventType[] = [
  'evaluation.submitted',
  'evaluation.scored',
  'submission.submitted',
  'realtime.connected',
  'realtime.ping',
];

const MAX_RECONNECT_DELAY_MS = 30000;

function sseUrl(hackathonId: string): string {
  return `${window.location.origin}${API_PREFIX}/sse/${encodeURIComponent(hackathonId)}`;
}

function wsUrl(hackathonId: string): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${API_PREFIX}/ws/${encodeURIComponent(hackathonId)}`;
}

function parseEvent(data: string): RealtimeEvent | null {
  try {
    const raw: unknown = JSON.parse(data);
    if (typeof raw !== 'object' || raw === null) return null;
    const candidate = raw as Partial<RealtimeEvent>;
    if (typeof candidate.event_id !== 'string') return null;
    if (typeof candidate.hackathon_id !== 'string') return null;
    if (typeof candidate.timestamp !== 'string') return null;
    if (typeof candidate.type !== 'string' || !EVENT_TYPES.includes(candidate.type as JudgingEventType)) return null;
    if (candidate.payload === undefined || typeof candidate.payload !== 'object') return null;
    return candidate as RealtimeEvent;
  } catch {
    return null;
  }
}

function connectSse(hackathonId: string, handlers: RealtimeHandlers): () => void {
  const source = new EventSource(sseUrl(hackathonId));
  source.onopen = () => handlers.onOpen?.();
  source.onerror = () => handlers.onError?.();
  source.onmessage = (message: MessageEvent) => {
    const event = parseEvent(String(message.data));
    if (event) handlers.onEvent(event);
  };
  return () => source.close();
}

function connectWebSocket(hackathonId: string, handlers: RealtimeHandlers): () => void {
  let closed = false;
  const socket = new WebSocket(wsUrl(hackathonId));
  socket.onopen = () => handlers.onOpen?.();
  socket.onerror = () => handlers.onError?.();
  socket.onmessage = (message: MessageEvent) => {
    const event = parseEvent(String(message.data));
    if (event) handlers.onEvent(event);
  };
  socket.onclose = () => {
    if (!closed) handlers.onClose?.();
  };
  return () => {
    closed = true;
    socket.close();
  };
}

/**
 * Subscribe to a hackathon's judging events. Returns a cleanup function.
 * `transport` defaults to SSE, which works through the Next.js `/api/*`
 * rewrite without proxy WebSocket support.
 */
export function subscribeLiveJudging(
  hackathonId: string,
  handlers: RealtimeHandlers,
  transport: RealtimeTransport = 'sse',
): () => void {
  return transport === 'ws' ? connectWebSocket(hackathonId, handlers) : connectSse(hackathonId, handlers);
}

/**
 * React hook that keeps a ring buffer of the hackathon's live judging events
 * and reconnects with exponential backoff when the stream drops.
 */
export function useRealtime(hackathonId: string, options: UseRealtimeOptions = {}): UseRealtimeResult {
  const {
    transport = 'sse',
    enabled = true,
    onEvent,
    onStatusChange,
    reconnectDelayMs = 3000,
    maxEvents = 50,
  } = options;

  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [status, setStatus] = useState<RealtimeStatus>('closed');
  const [error, setError] = useState<string | null>(null);

  const handlersRef = useRef({ onEvent, onStatusChange });
  handlersRef.current = { onEvent, onStatusChange };

  const pushEvent = useCallback(
    (event: RealtimeEvent) => {
      setEvents((previous) => [event, ...previous].slice(0, maxEvents));
      handlersRef.current.onEvent?.(event);
    },
    [maxEvents],
  );

  const updateStatus = useCallback((next: RealtimeStatus) => {
    setStatus(next);
    handlersRef.current.onStatusChange?.(next);
  }, []);

  useEffect(() => {
    if (!enabled) {
      updateStatus('closed');
      return;
    }

    let disposed = false;
    let closeConnection: (() => void) | null = null;
    let retryTimer: number | null = null;
    let attempt = 0;

    function clearRetry() {
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
      }
    }

    function scheduleRetry() {
      if (disposed) return;
      const delay = Math.min(reconnectDelayMs * 2 ** attempt, MAX_RECONNECT_DELAY_MS);
      attempt += 1;
      retryTimer = window.setTimeout(startConnection, delay);
    }

    function startConnection() {
      if (disposed) return;
      updateStatus('connecting');
      const connect = transport === 'ws' ? connectWebSocket : connectSse;
      try {
        closeConnection = connect(hackathonId, {
          onEvent: (event) => pushEvent(event),
          onOpen: () => {
            attempt = 0;
            setError(null);
            updateStatus('open');
          },
          onError: () => {
            if (disposed) return;
            setError(transport === 'ws' ? 'WebSocket connection lost' : 'Stream interrupted — reconnecting');
            updateStatus('error');
          },
          onClose: handleClose,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        updateStatus('error');
        scheduleRetry();
      }
    }

    function handleClose() {
      if (disposed) return;
      updateStatus('closed');
      if (transport === 'ws') scheduleRetry();
    }

    startConnection();

    return () => {
      disposed = true;
      clearRetry();
      closeConnection?.();
    };
  }, [enabled, hackathonId, transport, reconnectDelayMs, pushEvent, updateStatus]);

  return {
    events,
    status,
    error,
    isLive: status === 'open',
    latestEvent: events[0] ?? null,
  };
}
