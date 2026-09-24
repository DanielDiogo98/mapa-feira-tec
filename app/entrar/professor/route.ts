import { portalRedirect } from '../../../lib/portal-redirect';

export async function GET(request: Request) {
  return portalRedirect('TEACHER_PORTAL_URL', request.url);
}
