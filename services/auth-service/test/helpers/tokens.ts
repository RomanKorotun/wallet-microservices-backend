export function getToken(cookies: string[], token: string): string {
  const cookie = cookies.find((c) => c.startsWith(token));
  if (!cookie) throw new Error(`Cookie ${token} not found`);
  return cookie.split(';')[0].split('=')[1];
}
