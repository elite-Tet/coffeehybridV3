import { describe, expect, it } from 'vitest';
import { safeCallbackUrl } from '@/features/auth/safe-callback';

describe('safeCallbackUrl', () => {
    it('keeps same-site paths', () => {
        expect(safeCallbackUrl('/checkout')).toBe('/checkout');
        expect(safeCallbackUrl('/order/abc?x=1')).toBe('/order/abc?x=1');
    });

    it('falls back when missing', () => {
        expect(safeCallbackUrl(null)).toBe('/');
        expect(safeCallbackUrl('', '/menu')).toBe('/menu');
    });

    it('blocks absolute and protocol-relative URLs (open redirect)', () => {
        expect(safeCallbackUrl('https://evil.example')).toBe('/');
        expect(safeCallbackUrl('//evil.example')).toBe('/');
        expect(safeCallbackUrl('/\\evil.example')).toBe('/');
        expect(safeCallbackUrl('javascript:alert(1)')).toBe('/');
    });
});
