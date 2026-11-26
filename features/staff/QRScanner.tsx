'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { orderCode } from '@/features/orders/order-status';
import { boardButtonPrimary } from '@/components/layout/board-styles';
import { cn } from '@/lib/utils';

interface ScanResult {
    success: boolean;
    error?: string;
    data?: {
        _id: string;
    };
}

export default function QRScanner() {
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const isVerifyingRef = useRef(false); // Ref to track verifying state without re-triggering effect
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [manualCode, setManualCode] = useState('');

    /** One verification path for both the camera scan ({ qrCode }) and the typed ticket code ({ orderCode }). */
    const verify = useCallback(async (payload: { qrCode: string } | { orderCode: string }) => {
        if (isVerifyingRef.current) return;
        isVerifyingRef.current = true;
        setIsVerifying(true);

        // Stop the camera while we check this one
        if (scannerRef.current) {
            try { scannerRef.current.pause(); } catch { /* not scanning */ }
        }

        try {
            const response = await fetch('/api/staff/verify-qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                setScanResult({ success: true, data: data.data });
                setManualCode('');
                toast.success('Order verified');
                // Optionally clear scanner on success
                scannerRef.current?.clear();
            } else {
                setScanResult({ success: false, error: data.error, data: data.data });
                toast.error(data.error || 'Verification failed');
                // On failure, allow scanning again after a delay
                setTimeout(() => {
                    isVerifyingRef.current = false;
                    setIsVerifying(false);
                    setScanResult(null);
                }, 3000);
            }
        } catch {
            toast.error('Network error during verification');
            isVerifyingRef.current = false;
            setIsVerifying(false);
        }
    }, []);

    useEffect(() => {
        // Prevent double initialization
        if (scannerRef.current) return;


        // Initialize scanner with full-width configuration
        const width = window.innerWidth;
        const qrBoxSize = width > 600 ? 500 : 300; 

        const scanner = new Html5QrcodeScanner(
            "reader",
            { 
                fps: 15,
                qrbox: { width: qrBoxSize, height: qrBoxSize },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
                rememberLastUsedCamera: true,
            },
            /* verbose= */ false
        );

        const onScanSuccess = (decodedText: string) => {
            verify({ qrCode: decodedText });
        };

        const onScanFailure = () => {
            // Silence errors as they happen constantly during seek
        };

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;

        // Cleanup function
        return () => {
             if (scannerRef.current) {
                try {
                    scannerRef.current.clear();
                } catch {
                    // Ignore clear errors
                }
                scannerRef.current = null;
            }
        };
    }, [verify]); // verify is stable, so this still runs once on mount

    const resetScan = () => {
        setScanResult(null);
        if (scannerRef.current) {
            try {
                scannerRef.current.resume();
            } catch {
                // Ignore if not paused
            }
        }
        isVerifyingRef.current = false;
        setIsVerifying(false);
    };

    const resultCode = scanResult?.data?._id ? orderCode(scanResult.data._id.toString()) : null;

    return (
        <div className="w-full space-y-6">
            <header>
                <h1 className="display text-section">Scan pickups</h1>
                <p className="mt-2 text-muted-foreground">Scan the QR code on the customer’s ticket, or type its code below.</p>
            </header>

            {scanResult ? (
                <section
                    aria-labelledby="scan-result-title"
                    className="rounded-xl bg-panel p-6 shadow-[inset_0_0_0_1px_rgb(244_234_221/0.06)] sm:p-8"
                >
                    <div role="status" className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2
                                id="scan-result-title"
                                className={cn('display flex items-center gap-2.5 text-[2.5rem] leading-none', scanResult.success ? 'text-signal' : 'text-destructive')}
                            >
                                {scanResult.success
                                    ? <CheckCircle2 className="size-8 shrink-0" aria-hidden="true" />
                                    : <XCircle className="size-8 shrink-0" aria-hidden="true" />}
                                {scanResult.success ? 'Verified' : 'Not verified'}
                            </h2>
                            <p className="mt-3 text-lg">
                                {scanResult.success ? 'Hand the order over. It’s marked as picked up.' : scanResult.error}
                            </p>
                        </div>
                        {resultCode && (
                            <p className="ticket-number text-[clamp(3rem,12vw,4.5rem)]">
                                <span className="sr-only">Order </span>{resultCode}
                            </p>
                        )}
                    </div>

                    {/* Only an expired order comes back with its data; that's the case where the API adds a strike. */}
                    {!scanResult.success && scanResult.data?._id && (
                        <p className="mt-5 flex items-start gap-2 rounded-sm bg-st-expired/12 px-4 py-3 text-sm">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                            The pickup window closed, so the customer’s record gets a missed-pickup strike.
                        </p>
                    )}

                    <button type="button" onClick={resetScan} className={cn(boardButtonPrimary, 'mt-6 w-full')}>
                        <RefreshCw className="size-5" aria-hidden="true" />
                        Next customer
                    </button>
                </section>
            ) : (
                <div className="relative overflow-hidden rounded-xl bg-black">
                    <div id="reader" className="w-full overflow-hidden [&>div]:!border-none [&>div]:!shadow-none" />

                    {isVerifying ? (
                        <div className="absolute inset-0 z-50 flex items-center justify-center gap-3 bg-roast/85" role="status">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
                            <span className="font-bold">Checking the code…</span>
                        </div>
                    ) : (
                        <p className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black to-transparent px-6 pb-5 pt-10 text-center text-sm text-white/80">
                            Hold the ticket’s QR code inside the frame.
                        </p>
                    )}
                </div>
            )}

            {!scanResult && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (manualCode.trim()) verify({ orderCode: manualCode.trim() });
                    }}
                    className="rounded-xl bg-panel p-5"
                    aria-labelledby="manual-code-title"
                >
                    <h2 id="manual-code-title" className="display text-[1.5rem]">Camera not working?</h2>
                    <p id="manual-code-hint" className="mt-1 text-sm text-muted-foreground">
                        Type the 4-character code on the customer’s ticket, for example 49CC.
                    </p>
                    <div className="mt-3 flex gap-2">
                        <label htmlFor="manual-code" className="sr-only">Order code</label>
                        <input
                            id="manual-code"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                            maxLength={4}
                            autoComplete="off"
                            autoCapitalize="characters"
                            spellCheck={false}
                            aria-describedby="manual-code-hint"
                            placeholder="49CC"
                            className="display h-12 w-full min-w-0 rounded-sm border border-input bg-roast px-3 text-[1.75rem] tracking-[0.2em] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-signal"
                        />
                        <button
                            type="submit"
                            disabled={isVerifying || manualCode.trim().length !== 4}
                            className="display min-h-12 shrink-0 rounded-sm bg-signal px-5 text-[1.25rem] text-roast transition-colors hover:bg-signal/85 disabled:opacity-50"
                        >
                            Check code
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
