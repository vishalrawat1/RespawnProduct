/**
 * Shared in-memory mock storage for returns data.
 * Imported by both /api/returns/route.ts and /api/health-card/route.ts
 * to avoid cross-route imports which Turbopack doesn't support.
 */
export const MOCK_RETURNS: any[] = [];
