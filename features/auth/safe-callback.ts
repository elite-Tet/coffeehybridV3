/**
 * Only allow same-site paths as a post-login redirect target.
 * Blocks open redirects such as `/login?callbackUrl=https://evil.example`
 * or protocol-relative `//evil.example` (and the `/\evil.example` browser quirk).
 */
export function safeCallbackUrl(raw: string | null | undefined, fallback = '/'): string {
    if (!raw) return fallback;
    if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return fallback;
    return raw;
}
