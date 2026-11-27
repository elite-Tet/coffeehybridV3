import { describe, expect, it } from 'vitest';
import { ordersToCsv } from '@/features/admin/orders-csv';
import type { IOrder } from '@/types';

const order = (over: Partial<IOrder> = {}): IOrder => ({
    _id: '65f0c0ffee0000000000a27b',
    user: { _id: 'u1', name: 'Dara "D" Sok', email: 'dara@example.com' } as IOrder['user'],
    items: [
        { product: { name: 'Iced Latte' } as never, quantity: 2, customizations: {}, unitPrice: 3 },
        { product: 'not-populated', quantity: 1, customizations: {}, unitPrice: 2 },
    ],
    subtotal: 8,
    total: 8,
    status: 'completed',
    qrCode: 'qr',
    qrUsed: true,
    expiresAt: new Date('2026-11-27T10:30:00Z'),
    createdAt: new Date('2026-11-27T10:00:00Z'),
    updatedAt: new Date('2026-11-27T10:05:00Z'),
    ...over,
});

describe('ordersToCsv', () => {
    it('writes a header and one quoted row per order', () => {
        const [header, row] = ordersToCsv([order()]).split('\r\n');
        expect(header).toBe('"Code","Order ID","Placed","Customer","Email","Items","Status","Total"');
        expect(row).toBe(
            '"A27B","65f0c0ffee0000000000a27b","2026-11-27T10:00:00.000Z","Dara ""D"" Sok","dara@example.com","2 x Iced Latte; 1 x Item","Picked up","8.00"'
        );
    });

    it('defuses spreadsheet formulas in text cells', () => {
        const csv = ordersToCsv([order({ user: { name: '=HYPERLINK("x")', email: '' } as IOrder['user'] })]);
        expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    });

    it('handles unpopulated users', () => {
        const row = ordersToCsv([order({ user: 'u1' })]).split('\r\n')[1];
        expect(row).toContain('"2026-11-27T10:00:00.000Z","","",');
    });
});
