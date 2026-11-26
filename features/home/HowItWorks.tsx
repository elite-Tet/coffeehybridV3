const STEPS = [
    { title: 'Choose your drink', body: 'Pick a size, milk and sugar. Your total updates as you go.' },
    { title: 'Get your code', body: 'A short code and QR ticket land on your phone. The bar starts brewing.' },
    { title: 'Show it when it’s Ready', body: 'The barista scans your ticket and your drink is yours.' },
];

/** A real sequence, so numbered. `id="how-it-works"` is the target of header and footer links. */
export default function HowItWorks() {
    return (
        <section id="how-it-works" aria-labelledby="how-title" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 md:px-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <h2 id="how-title" className="display text-section">How pickup works</h2>
                <p className="max-w-[34rem] text-muted-foreground">About a minute on your phone, zero minutes in line.</p>
            </div>

            {/* Fills as the section scrolls into view (CSS scroll-driven; static under reduced motion). */}
            <div className="mb-8 h-1 overflow-hidden rounded-full bg-slat" aria-hidden="true">
                <span className="scroll-fill block h-full w-full origin-left bg-signal" />
            </div>

            <ol className="grid gap-8 lg:grid-cols-3">
                {STEPS.map((step, i) => (
                    <li key={step.title} className="grid grid-cols-[4rem_1fr] items-start gap-4">
                        <span className="display text-[4rem] font-black leading-[0.8] text-signal" aria-hidden="true">{i + 1}</span>
                        <div>
                            <h3 className="display text-[1.75rem]">{step.title}</h3>
                            <p className="mt-2 max-w-[30ch] text-muted-foreground">{step.body}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
