import { portalRedirect } from '../../../lib/portal-redirect';

export async function GET() {
  return portalRedirect('STUDENT_PORTAL_URL');
}
