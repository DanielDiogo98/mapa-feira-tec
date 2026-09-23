import type { FairProject } from './projects';

export async function loadProjects(
  fallback: FairProject[],
): Promise<FairProject[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '/api';
  try {
    const response = await fetch(`${baseUrl}/projects`, { cache: 'no-store' });
    if (!response.ok) return fallback;
    const body = (await response.json()) as { data?: unknown };
    return Array.isArray(body.data) ? (body.data as FairProject[]) : fallback;
  } catch {
    return fallback;
  }
}
