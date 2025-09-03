"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export type DecisionTreeConfig = {
    title: string;
    description?: string;
    parameters?: string[]; // [Transaction Amount, Urgency, Beneficiary Details]
    default_values?: string[]; // [Below Rs. 2 Lakh, Instant, VPA / QR Code]
};

const AMOUNT_OPTIONS = ["Below Rs. 2 Lakh", "Above Rs. 2 Lakh"] as const;
const URGENCY_OPTIONS = ["Instant", "Can wait a few hours"] as const;
const BENEFICIARY_OPTIONS = ["VPA / QR Code", "Bank A/c + IFSC"] as const;

type AmountOpt = typeof AMOUNT_OPTIONS[number];
type UrgencyOpt = typeof URGENCY_OPTIONS[number];
type BeneficiaryOpt = typeof BENEFICIARY_OPTIONS[number];

export default function DecisionTreeSelector({ config }: { config: DecisionTreeConfig }) {
    const defaults = config.default_values ?? [];
    const [amount, setAmount] = useState<AmountOpt>((defaults[0] as AmountOpt) || "Below Rs. 2 Lakh");
    const [urgency, setUrgency] = useState<UrgencyOpt>((defaults[1] as UrgencyOpt) || "Instant");
    const [beneficiary, setBeneficiary] = useState<BeneficiaryOpt>((defaults[2] as BeneficiaryOpt) || "VPA / QR Code");

    const decision = useMemo(() => recommend(amount, urgency, beneficiary), [amount, urgency, beneficiary]);

    return (
        <div className="space-y-4">
            <Card className="bg-white/70 border-white/60">
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1">
                            <Label>Transaction Amount</Label>
                            <Select defaultValue={amount} value={amount} onValueChange={(v) => setAmount(v as AmountOpt)}>
                                <SelectTrigger className="bg-white/80"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {AMOUNT_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Urgency</Label>
                            <Select defaultValue={urgency} value={urgency} onValueChange={(v) => setUrgency(v as UrgencyOpt)}>
                                <SelectTrigger className="bg-white/80"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {URGENCY_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Beneficiary Details</Label>
                            <Select defaultValue={beneficiary} value={beneficiary} onValueChange={(v) => setBeneficiary(v as BeneficiaryOpt)}>
                                <SelectTrigger className="bg-white/80"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {BENEFICIARY_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white/70 border-white/60">
                <CardContent className="pt-6 space-y-3">
                    <div className="text-sm text-muted-foreground">Recommended method</div>
                    <div className="rounded-lg border bg-white/60 p-4">
                        <div className="flex items-center gap-2">
                            <Badge className={badgeClass(decision.method)} variant="secondary">{decision.method}</Badge>
                            <span className="text-sm text-muted-foreground">{decision.tagline}</span>
                        </div>
                        <Separator className="my-3" />
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            {decision.points.map((p, i) => (
                                <li key={i}>{p}</li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

type Decision = {
    method: "UPI" | "IMPS" | "RTGS" | "NEFT";
    tagline: string;
    points: string[];
};

function recommend(amount: AmountOpt, urgency: UrgencyOpt, beneficiary: BeneficiaryOpt): Decision {
    // Simple rules aligned with fallback guidance
    if (beneficiary === "VPA / QR Code") {
        return {
            method: "UPI",
            tagline: "Instant, convenient transfers using VPA/QR across banks",
            points: [
                "24x7 availability, usually free",
                "Great for everyday payments and small-to-medium amounts",
                amount === "Above Rs. 2 Lakh" ? "Note: UPI limits vary by bank; large transfers may require IMPS/RTGS" : "",
            ].filter(Boolean) as string[],
        };
    }

    if (urgency === "Instant") {
        if (amount === "Above Rs. 2 Lakh") {
            return {
                method: "RTGS",
                tagline: "High‑value transfers with near‑real‑time settlement",
                points: [
                    "Best for urgent, high‑value payments",
                    "Typically available during banking hours",
                    "Use when immediate credit is required",
                ],
            };
        }
        return {
            method: "IMPS",
            tagline: "Instant transfers using account + IFSC, 24x7",
            points: [
                "Suitable for small to medium amounts",
                "Works anytime, including holidays",
            ],
        };
    }

    return {
        method: "NEFT",
        tagline: "Reliable bank transfers for non‑urgent payments",
        points: [
            "Good for scheduled or non‑urgent transfers",
            "Works for any transaction value",
        ],
    };
}

function badgeClass(method: Decision["method"]) {
    switch (method) {
        case "UPI":
            return "bg-emerald-100 text-emerald-700";
        case "IMPS":
            return "bg-sky-100 text-sky-700";
        case "RTGS":
            return "bg-indigo-100 text-indigo-700";
        case "NEFT":
            return "bg-amber-100 text-amber-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
}
