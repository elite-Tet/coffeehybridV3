/**
 * Shared class strings for the admin screens, on top of board-styles.ts.
 * Plain strings so they compose with shadcn Input, native select/textarea and buttons.
 */

/** Panel on the roast background, same as the pickup board. */
export const adminPanel = 'rounded-xl bg-panel shadow-[inset_0_0_0_1px_rgb(244_234_221/0.06)]';

/** Text field inside a panel or dialog: squared, sunk into roast. */
export const adminField =
    'h-11 w-full min-w-0 rounded-sm border border-input bg-roast px-3 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:border-signal';

/** Field label: sentence case, readable size (no tiny uppercase). */
export const adminLabel = 'text-sm font-bold text-foreground';

/** Square 44px icon button for row actions (edit, delete, remove). */
export const adminIconButton =
    'inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-slat hover:text-foreground';

/** Small outlined button (secondary actions, filters). */
export const adminOutlineButton =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-foreground/20 px-4 font-bold text-muted-foreground transition-colors hover:text-foreground';
