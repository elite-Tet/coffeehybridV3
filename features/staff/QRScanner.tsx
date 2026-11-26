// FIX: Replaced 'any' with proper type definition for scanResult
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { orderCode } from '@/features/orders/order-status';

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

    /**
     * Restart the camera for the next scan. The scanner is only ever paused,
     * never cleared, while this page is open: #reader stays mounted (hidden
     * behind the result card), so resume() always has a live scanner to wake.
     */
    const resumeScanning = useCallback(() => {
        if (scannerRef.current) {
            try { scannerRef.current.resume(); } catch { /* not paused, e.g. camera never started */ }
        }
        isVerifyingRef.current = false;
        setIsVerifying(false);
    }, []);

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
                toast.success('Order Verified!');
                // Camera stays paused until staff tap Next Customer
            } else {
                setScanResult({ success: false, error: data.error, data: data.data });
                toast.error(data.error || 'Verification failed');
                // On failure, allow scanning again after a delay
                setTimeout(() => {
                    setScanResult(null);
                    resumeScanning();
                }, 3000);
            }
        } catch {
            toast.error('Network error during verification');
            resumeScanning();
        }
    }, [resumeScanning]);

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

        // Cleanup on unmount: the only place the scanner is cleared
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
        resumeScanning();
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <header className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon" className="rounded-full h-12 w-12 hover:bg-primary/10">
                    <Link href="/staff" aria-label="Back to the order queue">
                        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">QR VERIFICATION</h1>
                    <p className="text-muted-foreground text-sm font-medium">Verify pickup tokens instantly.</p>
                </div>
            </header>

            <AnimatePresence initial={false}>
                {scanResult && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 rounded-[2rem] bg-card/60 backdrop-blur-xl border border-border/40 shadow-2xl flex flex-col items-center text-center gap-8"
                    >
                        {scanResult.success ? (
                            <>
                                <div className="p-6 rounded-full bg-st-ready/10 text-st-ready border border-st-ready/10">
                                    <CheckCircle className="w-16 h-16" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black tracking-tighter text-st-ready uppercase">Verified</h2>
                                    <p className="font-mono text-xs text-muted-foreground">ORDER {scanResult.data ? orderCode(scanResult.data._id.toString()) : ''}</p>
                                </div>
                                <div className="w-full p-6 rounded-3xl bg-st-ready/5 border border-st-ready/10 flex items-center justify-between font-bold">
                                    <span>Customer Ready</span>
                                    <span className="text-st-ready">Pick up now</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-6 rounded-full bg-destructive/10 text-destructive border border-destructive/10">
                                    <XCircle className="w-16 h-16" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black tracking-tighter text-destructive uppercase">Error</h2>
                                    <p className="font-bold text-lg opacity-80">{scanResult.error}</p>
                                    {scanResult.data?._id && (
                                        <p className="font-mono text-xs text-muted-foreground">ORDER {orderCode(scanResult.data._id.toString())}</p>
                                    )}
                                </div>
                                <div className="w-full p-4 rounded-3xl bg-destructive/5 text-destructive font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Strike Applied Automatically
                                </div>
                            </>
                        )}

                        <Button
                            onClick={resetScan}
                            className={`w-full h-16 text-xl font-black gap-2 transition-all duration-500 ${scanResult.success ? 'bg-signal text-roast hover:bg-signal/85' : 'bg-primary'}`}
                        >
                            <RefreshCw className="w-6 h-6" />
                            Next Customer
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kept mounted the whole time so html5-qrcode keeps its #reader element; hidden while a result shows */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                hidden={!!scanResult}
                className="relative overflow-hidden rounded-[2rem] border border-border/40 bg-black backdrop-blur-md shadow-2xl"
            >
                <div id="reader" className="w-full overflow-hidden [&>div]:!shadow-none [&>div]:!border-none" />

                {/* Scanner Laser (Pure visual effect) */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-signal/80 shadow-[0_0_15px_var(--signal)] z-10 pointer-events-none opacity-50" />

                {isVerifying ? (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-50">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="font-black text-sm uppercase tracking-widest text-primary animate-pulse">Verifying...</p>
                    </div>
                ) : (
                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black to-transparent pointer-events-none z-20">
                        <div className="flex items-center justify-center gap-3 text-white/70 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Scanning Active...</span>
                        </div>
                    </div>
                )}
            </motion.div>

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
