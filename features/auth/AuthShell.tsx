/** Shared frame for sign-in and sign-up: board-face title on a single panel. */
export default function AuthShell({ title, lede, children, footer }: { title: string; lede: string; children: React.ReactNode; footer: React.ReactNode }) {
    return (
        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center px-4 py-10 md:min-h-[calc(100dvh-72px)]">
            <h1 className="display text-section">{title}</h1>
            <p className="mt-2 text-muted-foreground">{lede}</p>
            <div className="mt-8 rounded-xl bg-panel p-5 sm:p-6">{children}</div>
            <p className="mt-6 text-center text-muted-foreground">{footer}</p>
        </div>
    );
}
