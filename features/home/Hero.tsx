import HeroActions from '@/features/home/HeroActions';
import PickupBoard from '@/features/home/PickupBoard';

export default function Hero() {
    return (
        <section aria-labelledby="hero-title" className="mx-auto max-w-7xl px-4 pb-16 pt-12 md:px-12">
            <h1 id="hero-title" className="display max-w-[10ch] text-hero font-black">
                Order now. Pick up when it says Ready.
            </h1>
            <div className="mt-8 grid items-start gap-12 lg:grid-cols-[1fr_1.25fr]">
                <div>
                    <p className="max-w-[34rem] text-xl text-muted-foreground">
                        Your order goes straight to the bar. Watch your code move up the board, then show it at the counter.
                    </p>
                    <HeroActions />
                </div>
                <PickupBoard />
            </div>
        </section>
    );
}
