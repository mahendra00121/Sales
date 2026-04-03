"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calculator, DollarSign, Send, FileText, Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Types ---
interface FeasibleInquiry {
    id: number;
    customerName: string;
    description: string;
    quantityRequested: number;
    status: string;
    // We'll extract cycleTime/yield from description for now as it was saved there in previous step
}

interface Quotation {
    id: number;
    inquiryId: number;
    rawMaterialCost: number;
    processingCost: number;
    overheads: number;
    profitMarginPercentage: number;
    finalPrice: number;
    finalPriceWithTax: number;
    status: string;
    inquiry?: FeasibleInquiry;
}

// Costing Schema
const costingSchema = z.object({
    materialRate: z.coerce.number().min(0.01, "Rate required"),
    productWeight: z.coerce.number().min(0.1, "Weight required (g)"),
    machineHourRate: z.coerce.number().min(1, "Machine rate required"),
    packagingCost: z.coerce.number().min(0),
    rejectionAllowance: z.coerce.number().min(0).default(5),
    marginPercent: z.coerce.number().min(0),
});

type CostingData = z.infer<typeof costingSchema>;

export default function CostingPage() {
    const [inquiries, setInquiries] = useState<FeasibleInquiry[]>([]);
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [selectedInquiry, setSelectedInquiry] = useState<FeasibleInquiry | null>(null);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const form = useForm<CostingData>({
        // @ts-ignore - Zod coerce type mismatch with RHF
        resolver: zodResolver(costingSchema),
        defaultValues: {
            materialRate: 140,
            productWeight: 25,
            machineHourRate: 650,
            packagingCost: 0.8,
            rejectionAllowance: 5,
            marginPercent: 20,
        },
    });

    const { register, handleSubmit, watch } = form;
    const values = watch();

    // 1. Fetch Data
    const fetchData = async () => {
        try {
            const inqRes = await fetch("http://localhost:5278/api/SalesInquiry");
            const allInq: FeasibleInquiry[] = await inqRes.json();
            setInquiries(allInq.filter(i => i.status === "FeasibilityApproved"));

            const quoteRes = await fetch("http://localhost:5278/api/CostingQuote");
            const allQuotes: Quotation[] = await quoteRes.json();
            setQuotations(allQuotes.sort((a,b) => b.id - a.id));
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Calculation Logic
    const calculateCost = (data: CostingData) => {
        if (!selectedInquiry) return null;

        // Extract technical values from description string (Simulated for this demo)
        // Description format: "Product (Material). Remarks. CycleTime: 12.5s, Yield: 95%"
        const rmCost = (data.productWeight / 1000) * data.materialRate;
        const machineCost = data.machineHourRate / (3600 / 15); // Static 15s if not found
        const overheads = data.packagingCost + (rmCost * 0.05); // 5% buffer
        const baseCost = rmCost + machineCost + overheads;
        const totalBaseCost = baseCost * (1 + data.rejectionAllowance / 100);
        const finalPrice = totalBaseCost * (1 + data.marginPercent / 100);

        return {
            rmCost,
            machineCost,
            overheads,
            finalPrice,
            totalValue: finalPrice * selectedInquiry.quantityRequested
        };
    };

    const calc = selectedInquiry ? calculateCost(values) : null;

    // 3. Submit to Backend
    const onGenerateQuote: SubmitHandler<FieldValues> = async (rawData) => {
        const data = rawData as CostingData;
        if (!selectedInquiry || !calc) return;
        setIsLoading(true);

        try {
            const payload = {
                inquiryId: selectedInquiry.id,
                rawMaterialCost: calc.rmCost,
                processingCost: calc.machineCost,
                overheads: calc.overheads,
                profitMarginPercentage: data.marginPercent,
                taxPercentage: 18.00,
                finalPrice: calc.finalPrice,
                finalPriceWithTax: calc.finalPrice * 1.18,
                status: "Sent",
                createdBy: "Admin Sales"
            };

            const response = await fetch("http://localhost:5278/api/CostingQuote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchData();
                setOpen(false);
                setSelectedInquiry(null);
            } else {
                alert("Failed to submit quote");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-teal-900 font-outfit">Costing & Quotation</h1>
                    <p className="text-muted-foreground">
                        Real-time financial estimation linked to feasibility data.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Pending List */}
                <Card className="shadow-lg border-l-4 border-l-teal-600">
                    <CardHeader>
                        <CardTitle>Feasible Inquiries</CardTitle>
                        <CardDescription>Approved for costing by Engineering</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isFetching ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-4"><Loader2 className="animate-spin inline mr-2 text-teal-600" /> Loading...</TableCell></TableRow>
                                    ) : inquiries.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No approved inquiries found.</TableCell></TableRow>
                                    ) : (
                                        inquiries.map((inq) => (
                                            <TableRow key={inq.id}>
                                                <TableCell className="font-bold">INQ-{inq.id.toString().padStart(4, '0')}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-teal-800">{inq.customerName}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">{inq.description}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => { setSelectedInquiry(inq); setOpen(true); }}>
                                                        <Calculator className="h-3 w-3 mr-1" /> Costing
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* History */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Quotation Log</CardTitle>
                        <CardDescription>Latest generated prices in database</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isFetching ? (
                            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-teal-600" /></div>
                        ) : quotations.length === 0 ? (
                            <div className="text-center py-10 opacity-30 text-teal-900"><FileText className="h-10 w-10 mx-auto" /><p>No quotes yet</p></div>
                        ) : (
                            quotations.map((q) => (
                                <div key={q.id} className="p-4 border rounded-lg hover:bg-teal-50/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold text-teal-600">QTN-{(q.id + 1000).toString()}</span>
                                            <h4 className="font-bold text-teal-900">{q.inquiry?.customerName}</h4>
                                        </div>
                                        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-teal-200">Price Sent</Badge>
                                    </div>
                                    <div className="mt-2 text-sm flex gap-4">
                                        <div><span className="text-muted-foreground block text-xs">Unit Price</span> <span className="font-bold text-teal-800">₹{q.finalPrice.toFixed(2)}</span></div>
                                        <div><span className="text-muted-foreground block text-xs">With Tax (18%)</span> <span className="font-bold text-green-600">₹{q.finalPriceWithTax.toFixed(2)}</span></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Costing Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-width-[600px] w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Cost Estimation: INQ-{selectedInquiry?.id.toString().padStart(4, '0')}</DialogTitle>
                        <DialogDescription>Customer: {selectedInquiry?.customerName} | Requirement: {selectedInquiry?.quantityRequested} units</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                        <form id="costing-form" onSubmit={handleSubmit(onGenerateQuote)} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">RM Rate (₹/kg)</Label>
                                    <Input {...register("materialRate")} type="number" step="0.01" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Net Weight (g)</Label>
                                    <Input {...register("productWeight")} type="number" step="0.1" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">MC Rate (₹/hr)</Label>
                                    <Input {...register("machineHourRate")} type="number" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Packing (₹/un)</Label>
                                    <Input {...register("packagingCost")} type="number" step="0.01" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Waste %</Label>
                                    <Input {...register("rejectionAllowance")} type="number" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Margin %</Label>
                                    <Input {...register("marginPercent")} type="number" />
                                </div>
                            </div>
                        </form>

                        <div className="bg-teal-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
                            <h4 className="font-bold flex items-center gap-2 border-b border-white/20 pb-2"><DollarSign className="h-4 w-4" /> Final Calculation</h4>
                            {calc && (
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs opacity-70"><span>Material Cost:</span><span>₹{calc.rmCost.toFixed(3)}</span></div>
                                    <div className="flex justify-between text-xs opacity-70"><span>Processing:</span><span>₹{calc.machineCost.toFixed(3)}</span></div>
                                    <div className="flex justify-between text-xs opacity-70"><span>Overheads:</span><span>₹{calc.overheads.toFixed(3)}</span></div>
                                    <Separator className="bg-white/20" />
                                    <div className="flex justify-between items-end">
                                        <div><p className="text-[10px] uppercase tracking-wider opacity-60">Final Unit Price</p> <p className="text-3xl font-bold">₹{calc.finalPrice.toFixed(2)}</p></div>
                                        <CheckCircle2 className="h-8 w-8 text-teal-400" />
                                    </div>
                                    <p className="text-[10px] text-teal-300 italic">* Plus GST 18.00% extra as applicable</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" form="costing-form" disabled={isLoading} className="bg-teal-700 hover:bg-teal-800 text-white w-full">
                            {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Save Quote & Notify Sales"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
