import { z } from 'zod';

/**
 * Shape of POST /api/orders. Prices are NOT trusted from the client:
 * the route recomputes every line from the product in the database.
 * Unknown keys (productName, productImage from the cart) are stripped.
 */
export const orderItemSchema = z.object({
    product: z.string().min(1, 'Missing product'),
    quantity: z.number().int().min(1).max(20),
    customizations: z
        .object({
            size: z.string().max(40).optional(),
            sugarLevel: z.string().max(40).optional(),
            iceOption: z.string().max(40).optional(),
            addOns: z.array(z.string().max(40)).max(10).optional(),
        })
        .default({}),
    unitPrice: z.number().nonnegative().optional(),
});

export const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1, 'Cart is empty').max(20, 'Too many items in one order'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
