import type { IOrder, IProduct, IUser } from '@/types';
import { ORDER_STATUS, orderCode } from '@/features/orders/order-status';

/** Quote a CSV cell and defuse spreadsheet formulas (cells starting with = + - @). */
function cell(value: string | number): string {
    let text = String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
}

function itemsText(order: IOrder): string {
    return order.items
        .map((i) => `${i.quantity} x ${typeof i.product === 'object' && i.product ? (i.product as IProduct).name : 'Item'}`)
        .join('; ');
}

/** Orders as CSV text: one row per order, header first. */
export function ordersToCsv(orders: IOrder[]): string {
    const header = ['Code', 'Order ID', 'Placed', 'Customer', 'Email', 'Items', 'Status', 'Total'];
    const rows = orders.map((o) => {
        const user = (typeof o.user === 'object' ? o.user : null) as IUser | null;
        return [
            orderCode(o._id.toString()),
            o._id.toString(),
            new Date(o.createdAt).toISOString(),
            user?.name ?? '',
            user?.email ?? '',
            itemsText(o),
            ORDER_STATUS[o.status]?.label ?? o.status,
            o.total.toFixed(2),
        ];
    });
    return [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
}

/** Save the CSV in the browser. */
export function downloadCsv(csv: string, filename: string) {
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
