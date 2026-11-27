import { describe, expect, it } from 'vitest';
import { describeCustomizations } from '@/features/orders/order-status';

describe('describeCustomizations', () => {
    it('does not double the word "sugar"', () => {
        expect(describeCustomizations({ sugarLevel: 'No Sugar' })).toBe('No Sugar');
    });

    it('adds "sugar" to bare levels', () => {
        expect(describeCustomizations({ sugarLevel: 'Light' })).toBe('Light sugar');
    });

    it('keeps "Hot" as-is instead of "Hot ice"', () => {
        expect(describeCustomizations({ iceOption: 'Hot' })).toBe('Hot');
    });

    it('does not double the word "ice"', () => {
        expect(describeCustomizations({ iceOption: 'Light Ice' })).toBe('Light Ice');
        expect(describeCustomizations({ iceOption: 'Less' })).toBe('Less ice');
    });

    it('joins size, sugar, ice and add-ons in order', () => {
        expect(
            describeCustomizations({ size: 'Grande', sugarLevel: 'Regular', iceOption: 'Regular Ice', addOns: ['Oat Milk'] })
        ).toBe('Grande, Regular sugar, Regular Ice, Oat Milk');
    });

    it('returns an empty string when nothing is chosen', () => {
        expect(describeCustomizations({})).toBe('');
    });
});
