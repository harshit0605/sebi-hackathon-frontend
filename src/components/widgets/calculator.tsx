"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export type CalculatorConfig = {
    title: string;
    description?: string;
    parameters?: string[];
    default_values?: string[];
};

export default function NetWorthCalculator({ config }: { config: CalculatorConfig }) {
    const names = config.parameters ?? [
        "Cash and Bank Balance",
        "Investments (Stocks, MFs, FDs)",
        "Property Value",
        "Other Assets",
        "Loans (Home, Car, etc.)",
        "Credit Card Dues",
    ];
    const defaults = config.default_values ?? new Array(names.length).fill("0");

    const [values, setValues] = useState<string[]>(() =>
        names.map((_, i) => (defaults[i] ?? "0").toString())
    );

    const formatINR = (n: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(Math.round(n));

    // Helper detection and parsing
    const namesLower = useMemo(() => names.map((n) => n.toLowerCase()), [names]);
    const getNum = (substr: string) => {
        const idx = namesLower.findIndex((l) => l.includes(substr.toLowerCase()));
        if (idx === -1) return 0;
        const raw = (values[idx] ?? "0").toString().replace(/,/g, "");
        const num = parseFloat(raw);
        return Number.isFinite(num) ? num : 0;
    };

    const isLoan = useMemo(
        () => ["loan amount", "interest", "tenure"].every((k) => namesLower.some((n) => n.includes(k))),
        [namesLower]
    );
    const isRetirement = useMemo(
        () =>
            [
                "current age",
                "retirement age",
                "monthly investment",
                "expected annual return",
            ].every((k) => namesLower.some((n) => n.includes(k))),
        [namesLower]
    );

    type View = {
        mode: "networth" | "loan" | "retirement";
        metrics: { label: string; value: number; tone?: "good" | "warn" | "bad" }[];
        progress?: number; // only for networth health
        hint?: { tone: "good" | "bad"; text: string };
    };

    const view: View = useMemo(() => {
        if (isLoan) {
            const P = getNum("loan amount");
            const annualRate = getNum("interest");
            const years = getNum("tenure");
            const r = annualRate / 12 / 100;
            const N = Math.max(0, Math.round(years * 12));
            const factor = r > 0 ? Math.pow(1 + r, N) : 1;
            const emi = N > 0 ? (r > 0 ? (P * r * factor) / (factor - 1) : P / N) : 0;
            const totalPayment = emi * N;
            const totalInterest = Math.max(0, totalPayment - P);
            return {
                mode: "loan",
                metrics: [
                    { label: "EMI (per month)", value: emi, tone: "warn" },
                    { label: "Total Interest", value: totalInterest, tone: "bad" },
                    { label: "Total Payment", value: totalPayment, tone: "good" },
                ],
            };
        }

        if (isRetirement) {
            const currentAge = getNum("current age");
            const retirementAge = getNum("retirement age");
            const M = getNum("monthly investment");
            const annualReturn = getNum("expected annual return");
            const months = Math.max(0, Math.round((retirementAge - currentAge) * 12));
            const i = annualReturn / 12 / 100;
            const factor = i > 0 ? Math.pow(1 + i, months) : 1;
            const corpus = i > 0 ? M * ((factor - 1) / i) : M * months; // end-of-month SIP
            const invested = M * months;
            const returns = Math.max(0, corpus - invested);
            return {
                mode: "retirement",
                metrics: [
                    { label: "Corpus at retirement", value: corpus, tone: "good" },
                    { label: "Total invested", value: invested, tone: "warn" },
                    { label: "Est. returns", value: returns, tone: "good" },
                ],
            };
        }

        // Fallback: Net worth calculator (last two fields = liabilities)
        const nums = values.map((v) => parseFloat((v || "0").toString().replace(/,/g, "")) || 0);
        const assetSlice = nums.slice(0, Math.max(0, nums.length - 2));
        const liabilitySlice = nums.slice(-2);
        const assetTotal = assetSlice.reduce((a, b) => a + b, 0);
        const liabilityTotal = liabilitySlice.reduce((a, b) => a + b, 0);
        const netWorth = assetTotal - liabilityTotal;
        const ratio = Math.max(0, Math.min(100, assetTotal === 0 ? 0 : ((assetTotal - liabilityTotal) / assetTotal) * 100));
        return {
            mode: "networth",
            metrics: [
                { label: "Assets", value: assetTotal, tone: "good" },
                { label: "Liabilities", value: liabilityTotal, tone: "warn" },
                { label: "Net worth", value: netWorth, tone: netWorth >= 0 ? "good" : "bad" },
            ],
            progress: ratio,
            hint:
                netWorth >= 0
                    ? {
                        tone: "good",
                        text: "Your assets exceed your liabilities. Consider allocating more to investments to grow wealth steadily.",
                    }
                    : {
                        tone: "bad",
                        text: "Your liabilities exceed your assets. Try reducing high-interest debt (e.g., credit cards) first.",
                    },
        };
    }, [values, namesLower, isLoan, isRetirement]);

    const reset = () => setValues(names.map((_, i) => (defaults[i] ?? "0").toString()));

    return (
        <div className="space-y-4">
            <Card className="bg-white/70 border-white/60">
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {names.map((label, i) => (
                            <div key={i} className="space-y-1">
                                <Label htmlFor={`calc-${i}`}>{label}</Label>
                                <Input
                                    id={`calc-${i}`}
                                    inputMode="decimal"
                                    type="number"
                                    value={values[i] ?? ""}
                                    onChange={(e) =>
                                        setValues((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                                    }
                                    className="bg-white/80"
                                    placeholder="0"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" onClick={reset}>
                            Reset to defaults
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white/70 border-white/60">
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        {view.metrics.map((m, idx) => (
                            <Metric key={idx} label={m.label} value={formatINR(m.value)} tone={m.tone ?? "good"} />
                        ))}
                    </div>
                    {view.mode === "networth" ? (
                        <>
                            <div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span>Health indicator</span>
                                    <span>{Math.round(view.progress ?? 0)}%</span>
                                </div>
                                <Progress value={view.progress ?? 0} />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {view.hint?.tone === "good" ? (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Positive</Badge>
                                        {view.hint.text}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-red-100 text-red-700">Negative</Badge>
                                        {view.hint?.text}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "good" | "warn" | "bad" }) {
    const toneClass =
        tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-red-700" : "text-amber-700";
    return (
        <div className="rounded-lg border p-4 bg-white/60">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`text-xl font-semibold ${toneClass}`}>{value}</div>
        </div>
    );
}
