'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { IProduct, ISize } from '@/types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useCartStore } from '@/features/cart/cart.store';
import { cn } from '@/lib/utils';

interface ProductModalProps {
    product: IProduct | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Element to refocus when the sheet closes (it is opened from code, not a DialogTrigger). */
    returnFocusTo?: React.RefObject<HTMLElement | null>;
}

function ChoiceGroup({
    legend,
    name,
    value,
    onChange,
    options,
}: {
    legend: string;
    name: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string; hint?: string }[];
}) {
    return (
        <fieldset className="space-y-2.5">
            <legend className="display text-[1.375rem]">{legend}</legend>
            <RadioGroup value={value} onValueChange={onChange} className="flex flex-wrap gap-2" aria-label={legend}>
                {options.map((o) => {
                    const id = `${name}-${o.value}`;
                    const active = value === o.value;
                    return (
                        <label
                            key={o.value}
                            htmlFor={id}
                            className={cn(
                                'flex min-h-11 cursor-pointer items-center gap-1.5 rounded-sm px-4 text-base transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                                active ? 'bg-signal font-bold text-roast' : 'bg-slat text-foreground/85 hover:text-foreground'
                            )}
                        >
                            <span className="sr-only"><RadioGroupItem value={o.value} id={id} /></span>
                            {o.label}
                            {o.hint && <span className={active ? 'font-normal opacity-80' : 'text-muted-foreground'}>{o.hint}</span>}
                        </label>
                    );
                })}
            </RadioGroup>
        </fieldset>
    );
}

/** Customize sheet: slides up from the bottom on phones, centred dialog on larger screens. */
export default function ProductModal({ product, open, onOpenChange, returnFocusTo }: ProductModalProps) {
    const addItem = useCartStore((state) => state.addItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);

    const [selectedSize, setSelectedSize] = useState<ISize | null>(product?.customizationOptions.sizes[0] || null);
    const [selectedSugar, setSelectedSugar] = useState<string>(product?.customizationOptions.sugarLevels[0] || '');
    const [selectedIce, setSelectedIce] = useState<string>(product?.customizationOptions.iceOptions[0] || '');
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [imgOk, setImgOk] = useState(Boolean(product?.imageUrl));

    const unitPrice = useMemo(() => {
        if (!product) return 0;
        let price = product.basePrice;
        if (selectedSize) price += selectedSize.priceModifier;
        selectedAddOns.forEach((label) => {
            const addOn = product.customizationOptions.addOns.find((a) => a.label === label);
            if (addOn) price += addOn.price;
        });
        return price;
    }, [product, selectedSize, selectedAddOns]);

    if (!product) return null;
    const o = product.customizationOptions;

    const handleAddToCart = () => {
        addItem(product, { size: selectedSize?.label, sugarLevel: selectedSugar, iceOption: selectedIce, addOns: selectedAddOns }, unitPrice);
        if (quantity > 1) updateQuantity(useCartStore.getState().items.length - 1, quantity);
        toast.success(quantity > 1 ? `${quantity} × ${product.name} added` : `${product.name} added`);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                onCloseAutoFocus={(e) => {
                    if (returnFocusTo?.current?.isConnected) {
                        e.preventDefault();
                        returnFocusTo.current.focus();
                    }
                }}
                className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-xl border-0 bg-panel p-0 sm:max-w-lg max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-2xl data-open:max-sm:slide-in-from-bottom-10 data-open:max-sm:zoom-in-100"
            >
                <div className="overflow-y-auto overscroll-contain">
                    {imgOk && (
                        <div className="relative aspect-[16/9] w-full bg-slat">
                            <Image src={product.imageUrl} alt="" fill sizes="512px" className="object-cover" onError={() => setImgOk(false)} />
                        </div>
                    )}

                    <div className="space-y-6 p-5">
                        <div className="space-y-1 pr-6">
                            <DialogTitle className="display text-[2.5rem] leading-none">{product.name}</DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground">{product.description}</DialogDescription>
                        </div>

                        {o.sizes.length > 0 && (
                            <ChoiceGroup
                                legend="Size"
                                name="size"
                                value={selectedSize?.label ?? ''}
                                onChange={(v) => setSelectedSize(o.sizes.find((s) => s.label === v) || null)}
                                options={o.sizes.map((s) => ({ value: s.label, label: s.label, hint: s.priceModifier > 0 ? `+$${s.priceModifier.toFixed(2)}` : undefined }))}
                            />
                        )}
                        {o.sugarLevels.length > 0 && (
                            <ChoiceGroup legend="Sugar" name="sugar" value={selectedSugar} onChange={setSelectedSugar} options={o.sugarLevels.map((l) => ({ value: l, label: l }))} />
                        )}
                        {o.iceOptions.length > 0 && (
                            <ChoiceGroup legend="Ice" name="ice" value={selectedIce} onChange={setSelectedIce} options={o.iceOptions.map((l) => ({ value: l, label: l }))} />
                        )}

                        {o.addOns.length > 0 && (
                            <fieldset className="space-y-2.5">
                                <legend className="display text-[1.375rem]">Add-ons</legend>
                                <div className="divide-y divide-roast/60 overflow-hidden rounded-lg bg-slat">
                                    {o.addOns.map((addOn) => {
                                        const id = `addon-${addOn.label}`;
                                        return (
                                            <label key={addOn.label} htmlFor={id} className="flex min-h-12 cursor-pointer items-center gap-3 px-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-ring">
                                                <Checkbox
                                                    id={id}
                                                    className="size-5 rounded-sm border-dust"
                                                    checked={selectedAddOns.includes(addOn.label)}
                                                    onCheckedChange={(checked) =>
                                                        setSelectedAddOns(checked ? [...selectedAddOns, addOn.label] : selectedAddOns.filter((a) => a !== addOn.label))
                                                    }
                                                />
                                                <span className="flex-1">{addOn.label}</span>
                                                <span className="text-sm tabular-nums text-muted-foreground">+${addOn.price.toFixed(2)}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-roast/60 p-4 safe-bottom">
                    <div className="flex items-center rounded-sm bg-slat" role="group" aria-label="Quantity">
                        <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex size-11 items-center justify-center rounded-sm disabled:opacity-40" disabled={quantity === 1} aria-label="One less">
                            <Minus className="size-4" aria-hidden="true" />
                        </button>
                        <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">{quantity}</span>
                        <button type="button" onClick={() => setQuantity((q) => q + 1)} className="flex size-11 items-center justify-center rounded-sm" aria-label="One more">
                            <Plus className="size-4" aria-hidden="true" />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className="display flex min-h-[52px] flex-1 items-center justify-between rounded-sm bg-signal px-5 text-[1.375rem] tracking-[0.02em] text-roast transition-colors hover:bg-[#ffc457] active:scale-[0.98]"
                    >
                        <span>Add to order</span>
                        <span className="tabular-nums">${(unitPrice * quantity).toFixed(2)}</span>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
