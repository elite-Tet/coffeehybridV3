/** The two business rules, stated plainly: 30-minute hold and the 3-strike pause. */
export default function PickupPolicy() {
    return (
        <section aria-labelledby="policy-title" className="mx-auto max-w-7xl px-4 py-16 md:px-12">
            <div className="grid gap-8 rounded-xl border-2 border-signal px-6 py-8 sm:p-12 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-16">
                <p className="display text-[clamp(6rem,18vw,12rem)] font-black leading-[0.8] text-signal" aria-hidden="true">
                    30
                    <small className="mt-2 block text-[1.75rem] font-extrabold text-foreground">minutes</small>
                </p>
                <div className="grid max-w-[34rem] gap-4 text-muted-foreground">
                    <h2 id="policy-title" className="display text-[1.75rem] text-foreground">We hold every order for 30 minutes</h2>
                    <p>Your drink is made when you order. After 30 minutes it expires, so nothing sits going cold.</p>
                    <p>An expired order counts as a missed pickup. Miss three and ordering pauses for 24 hours. You can still browse the menu while it’s paused.</p>
                </div>
            </div>
        </section>
    );
}
