import { portalRedirect } from '../../../lib/portal-redirect';

export async function GET() {
  return portalRedirect('TEACHER_PORTAL_URL');
}
