/**
 * Shared class strings for Direction C's board-style controls.
 * Kept as plain strings (not a component) so they compose with Link, button and asChild.
 */

/** Base: board face, squared slat corners, 52px tall. */
export const boardButton =
    'display inline-flex min-h-[52px] items-center justify-center gap-2 rounded-sm px-6 text-[1.375rem] tracking-[0.02em] transition-colors';

/** Primary call to action: signal fill. */
export const boardButtonPrimary = `${boardButton} bg-signal text-roast hover:bg-[#ffc457]`;

/** Secondary: outlined in foam. */
export const boardButtonGhost = `${boardButton} text-foreground shadow-[inset_0_0_0_2px_var(--foam)] hover:bg-foreground/10`;
