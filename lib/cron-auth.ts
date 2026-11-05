/**
 * Returns true only when the request carries `Authorization: Bearer <CRON_SECRET>`.
 * Fails closed: if CRON_SECRET is not configured, nothing is authorized
 * (previously `Bearer undefined` would have matched an unset secret).
 */
export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}
