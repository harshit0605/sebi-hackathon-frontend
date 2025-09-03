"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export type ScenarioBuilderConfig = {
    title: string;
    description?: string;
    parameters?: string[]; // [Specific, Measurable, Achievable / month, Realistic reason, Time-bound years]
    default_values?: string[];
};

export default function SmartGoalSetter({ config }: { config: ScenarioBuilderConfig }) {
    const defaults = config.default_values ?? [];
    const [specific, setSpecific] = useState<string>(defaults[0] ?? "");
    const [measurable, setMeasurable] = useState<string>(defaults[1] ?? "");
    const [perMonth, setPerMonth] = useState<string>(defaults[2] ?? "");
    const [reason, setReason] = useState<string>(defaults[3] ?? "");
    const [years, setYears] = useState<string>(defaults[4] ?? "");

    const asNumber = (v: string) => parseFloat((v || "0").toString().replace(/,/g, "")) || 0;

    const { total, monthlyNeeded, months, feasible } = useMemo(() => {
        const total = asNumber(measurable);
        const yearsNum = asNumber(years);
        const months = Math.max(1, Math.round(yearsNum * 12));
        const monthlyNeeded = total / months;
        const feasible = asNumber(perMonth) >= monthlyNeeded * 0.9; // small tolerance
        return { total, monthlyNeeded, months, feasible };
    }, [measurable, years, perMonth]);

    const formatINR = (n: number) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
            Math.round(n)
        );

    const statement = useMemo(() => {
        if (!specific && !total && !perMonth && !reason && !years) return "";
        const yrs = asNumber(years);
        const yrsText = `${yrs} year${yrs === 1 ? "" : "s"}`;
        return `I will ${specific || "my goal"} by saving ${formatINR(total)} in ${yrsText}, by setting aside ${formatINR(
            asNumber(perMonth)
        )} per month, because ${reason || "it matters to me"}.`;
    }, [specific, total, perMonth, reason, years]);

    return (
        <div className="space-y-4">
            <Card className="bg-white/70 border-white/60">
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1 sm:col-span-2">
                            <Label>Specific Goal (What?)</Label>
                            <Input value={specific} onChange={(e) => setSpecific(e.target.value)} placeholder="e.g., For a family vacation" />
                        </div>
                        <div className="space-y-1">
                            <Label>Measurable Amount (₹)</Label>
                            <Input inputMode="decimal" type="number" value={measurable} onChange={(e) => setMeasurable(e.target.value)} placeholder="e.g., 200000" />
                        </div>
                        <div className="space-y-1">
                            <Label>Achievable Savings per Month (₹)</Label>
                            <Input inputMode="decimal" type="number" value={perMonth} onChange={(e) => setPerMonth(e.target.value)} placeholder="e.g., 15000" />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                            <Label>Realistic Reason (Why?)</Label>
                            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., To create lasting memories with my family" />
                        </div>
                        <div className="space-y-1">
                            <Label>Time-bound Period (Years)</Label>
                            <Input inputMode="decimal" type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="e.g., 1" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white/70 border-white/60">
                <CardContent className="pt-6 space-y-3">
                    <div className="text-sm text-muted-foreground">Your SMART goal</div>
                    <div className="rounded-lg border bg-white/60 p-4 text-sm">
                        {statement || "Fill in the details above to generate your goal statement."}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Info label="Target amount" value={formatINR(total)} />
                        <Info label={`Timeframe (${months} months)`} value={`${months} months`} />
                        <Info label="Required per month" value={formatINR(monthlyNeeded)} />
                    </div>
                    <div className="text-sm">
                        {feasible ? (
                            <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-100 text-emerald-700" variant="secondary">Feasible</Badge>
                                Your plan looks feasible with your current monthly savings.
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Badge className="bg-amber-100 text-amber-700" variant="secondary">Shortfall</Badge>
                                You may need to increase monthly savings or extend the timeframe to meet the target.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border p-4 bg-white/60">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
        </div>
    );
}
