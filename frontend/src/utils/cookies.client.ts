export function getCookie(name: string): string | null {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=').slice(1).join('=') ?? null;
}
