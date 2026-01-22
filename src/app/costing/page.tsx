"use client";

import { useState } from "react";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calculator, DollarSign, Send, FileText } from "lucide-react";

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

// Define Types
interface FeasibleInquiry {
    id: string;
    customer: string;
    product: string;
    material: string;
    quantity: number;
    cycleTime: number;
    yield: number;
    mold: string;
    status: "Feasible" | "Processed";
}

interface Quotation extends FeasibleInquiry {
    quoteId: string;
    date: string;
    finalPrice: number;
    totalValue: number;
    rmCost?: number;
    machineCost?: number;
    moldAmortization?: number;
    rejectionCost?: number;     // Added
    totalBaseCost?: number;
    approvalStatus?: "Pending" | "Approved"; // Added
}

// Mock Data
const feasibleInquiries: FeasibleInquiry[] = [
    {
        id: "INQ-2024-001",
        customer: "Acme Corp",
        product: "Food Tray 500ml",
        material: "PET",
        quantity: 50000,
        cycleTime: 12.5, // seconds
        yield: 95, // %
        mold: "Existing",
        status: "Feasible",
    },
    {
        id: "INQ-2024-005",
        customer: "Fresh Foods Ltd",
        product: "Burger Box",
        material: "HIPS",
        quantity: 25000,
        cycleTime: 18.0,
        yield: 92,
        mold: "New",
        status: "Feasible",
    }
];

// Costing Schema
const costingSchema = z.object({
    materialRate: z.coerce.number().min(0.01, "Rate required"),
    productWeight: z.coerce.number().min(0.1, "Weight required (g)"),
    machineHourRate: z.coerce.number().min(1, "Machine rate required"),
    packagingCost: z.coerce.number().min(0),
    rejectionAllowance: z.coerce.number().min(0).default(5), // New field
    marginPercent: z.coerce.number().min(0),
    moldCost: z.coerce.number().default(0),
});

type CostingData = z.infer<typeof costingSchema>;

export default function CostingPage() {
    const [inquiries, setInquiries] = useState<FeasibleInquiry[]>(feasibleInquiries);
    const [selectedInquiry, setSelectedInquiry] = useState<FeasibleInquiry | null>(null);
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [open, setOpen] = useState(false);

    const form = useForm<CostingData>({
        // @ts-expect-error - known issue with zodResolver type inference with coerce
        resolver: zodResolver(costingSchema),
        defaultValues: {
            materialRate: 120, // $/kg
            productWeight: 15, // grams
            machineHourRate: 500, // $/hr
            packagingCost: 0.5, // per unit
            rejectionAllowance: 5, // %
            marginPercent: 20,
            moldCost: 0,
        },
    });

    const { register, handleSubmit, watch } = form;

    // Watch values for real-time calculation
    const values = watch();

    const calculateCost = (data: CostingData) => {
        if (!selectedInquiry) return null;

        // 1. Material Cost per Unit
        // Weight (kg) = weight(g) / 1000
        // Gross Weight = Net Weight / Yield%
        // RM Cost = Gross Weight * Rate
        const netWeightKg = data.productWeight / 1000;
        const grossWeightKg = netWeightKg / (selectedInquiry.yield / 100);
        const rmCost = grossWeightKg * data.materialRate;

        // 2. Conversion/Machine Cost per Unit
        // Units per Hour = 3600 / Cycle Time
        // Machine Cost = Hourly Rate / Units per Hour
        const unitsPerHour = 3600 / selectedInquiry.cycleTime;
        const machineCost = data.machineHourRate / unitsPerHour;

        // 3. Mold Amortization (if applicable)
        const moldCost = data.moldCost || 0;
        const moldAmortization = moldCost > 0 ? (moldCost / selectedInquiry.quantity) : 0;

        // 4. Base Cost (Before Commercials)
        const baseCost = rmCost + machineCost + data.packagingCost + moldAmortization;

        // 5. Quality & Rejection Allowance
        const rejectionCost = baseCost * (data.rejectionAllowance / 100);

        // 6. Total Cost
        const totalBaseCost = baseCost + rejectionCost;

        // 7. Final Price
        const finalPrice = totalBaseCost * (1 + data.marginPercent / 100);

        return {
            rmCost,
            machineCost,
            moldAmortization,
            baseCost,
            rejectionCost,
            totalBaseCost,
            finalPrice,
            totalValue: finalPrice * selectedInquiry.quantity
        };
    };

    const calculatedValues = selectedInquiry ? calculateCost(values) : null;

    // Fix: Use FieldValues to satisfy type checker, then cast to CostingData
    const onGenerateQuote: SubmitHandler<FieldValues> = (rawData) => {
        const data = rawData as CostingData;
        if (!selectedInquiry) return;
        const calc = calculateCost(data);

        if (calc) {
            setQuotation({
                ...selectedInquiry,
                quoteId: `QT-${selectedInquiry.id.split('-')[1]}-${Math.floor(Math.random() * 1000)}`,
                date: new Date().toLocaleDateString(),
                finalPrice: calc.finalPrice,
                totalValue: calc.totalValue,
                rmCost: calc.rmCost,
                machineCost: calc.machineCost,
                moldAmortization: calc.moldAmortization,
                rejectionCost: calc.rejectionCost, // Added
                totalBaseCost: calc.totalBaseCost,
                status: "Processed",
                approvalStatus: "Pending" // Initial status
            });

            // Remove from list or mark processed
            setInquiries(inquiries.filter(i => i.id !== selectedInquiry.id));
            setOpen(false);
            setSelectedInquiry(null);
        }
    };

    // Mock Approval Function
    const handleApprove = () => {
        if (quotation) {
            // force update to trigger re-render if needed, though state is simple object
            // In a real app, this would update status to 'Approved'
            alert("Quotation Approved by Sales Head!");
        }
    }

    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Costing & Quotation</h1>
                    <p className="text-muted-foreground">
                        Calculate costs, apply margins, and generate customer quotations.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Inquiry List */}
                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>FeasibleInquiries</CardTitle>
                        <CardDescription>Ready for costing</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto w-full max-w-[85vw] sm:max-w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">ID</TableHead>
                                        <TableHead className="whitespace-nowrap">Customer</TableHead>
                                        <TableHead className="whitespace-nowrap">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inquiries.map((inq: FeasibleInquiry) => (
                                        <TableRow key={inq.id}>
                                            <TableCell className="font-medium whitespace-nowrap">{inq.id}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span>{inq.customer}</span>
                                                    <span className="text-xs text-muted-foreground">{inq.product} ({inq.quantity})</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedInquiry(inq);
                                                        setOpen(true);
                                                    }}
                                                >
                                                    <Calculator className="h-4 w-4 mr-2" />
                                                    Costing
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Quotations / Active Quote View */}
                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>Generated Quotation</CardTitle>
                        <CardDescription>Latest approved estimation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {quotation ? (
                            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-primary">{quotation.quoteId}</h3>
                                        <p className="text-sm text-muted-foreground">For: {quotation.customer}</p>
                                    </div>
                                    <Badge className="bg-orange-500">Pending Approval</Badge>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Product</p>
                                        <p className="font-medium">{quotation.product}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Quantity</p>
                                        <p className="font-medium">{quotation.quantity.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Unit Price</p>
                                        <p className="font-bold text-lg">${quotation.finalPrice?.toFixed(3)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Total Value</p>
                                        <p className="font-bold text-lg text-green-600">${quotation.totalValue?.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-black/20 p-3 rounded text-xs space-y-2">
                                    <p className="font-semibold text-muted-foreground">Generated Documents:</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="flex gap-1"><FileText className="h-3 w-3" /> Quotation</Badge>
                                        <Badge variant="outline" className="flex gap-1"><FileText className="h-3 w-3" /> Technical Specs</Badge>
                                        <Badge variant="outline" className="flex gap-1"><Calculator className="h-3 w-3" /> Delivery Schedule</Badge>
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                                    <Button className="flex-1 bg-green-600 hover:bg-green-700 w-full sm:w-auto" onClick={handleApprove}>
                                        Approve (Sales Head)
                                    </Button>
                                    <Button className="flex-1 w-full sm:w-auto" variant="outline">
                                        <Send className="mr-2 h-4 w-4" /> Email Customer
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-dashed border-2 rounded-lg">
                                <FileText className="h-8 w-8 mb-2 opacity-50" />
                                <p>No quotation generated yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Costing Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[800px] w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Cost Estimation Sheet</DialogTitle>
                        <DialogDescription>
                            {selectedInquiry?.product} for {selectedInquiry?.customer}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Input Form */}
                        <form id="costing-form" onSubmit={handleSubmit(onGenerateQuote)} className="space-y-4">
                            <div className="space-y-2">
                                <Label>1. Raw Material</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Rate ($/kg)</Label>
                                        <Input {...register("materialRate")} type="number" step="0.01" />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Weight (g)</Label>
                                        <Input {...register("productWeight")} type="number" step="0.1" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>2. Production</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Machine & Labor Rate ($/hr)</Label>
                                        <Input {...register("machineHourRate")} type="number" />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Cycle Time (s)</Label>
                                        <Input disabled value={selectedInquiry?.cycleTime || 0} className="bg-muted" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>3. Overheads</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Packing & Logistics ($/unit)</Label>
                                        <Input {...register("packagingCost")} type="number" step="0.01" />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Mold Cost (Lump Sum)</Label>
                                        <Input {...register("moldCost")} type="number" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>4. Commercials</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Quality/Rejection Allowance (%)</Label>
                                        <Input {...register("rejectionAllowance")} type="number" step="0.5" />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Profit Margin (%)</Label>
                                        <Input {...register("marginPercent")} type="number" step="0.1" />
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Live Preview */}
                        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                            <h4 className="font-semibold flex items-center gap-2">
                                <DollarSign className="h-4 w-4" /> Cost Breakdown (Per Unit)
                            </h4>
                            {selectedInquiry && calculatedValues && (
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span>Material Cost:</span>
                                        <span>${calculatedValues.rmCost.toFixed(4)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Machine & Labor:</span>
                                        <span>${calculatedValues.machineCost.toFixed(4)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Packing & Logistics:</span>
                                        <span>${values.packagingCost}</span>
                                    </div>

                                    {calculatedValues.moldAmortization > 0 && (
                                        <div className="flex justify-between">
                                            <span>Mold Amort.:</span>
                                            <span>${calculatedValues.moldAmortization.toFixed(4)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-orange-600">
                                        <span>Quality Allowance:</span>
                                        <span>${calculatedValues.rejectionCost.toFixed(4)}</span>
                                    </div>

                                    <Separator />
                                    <div className="flex justify-between font-medium">
                                        <span>Total Base Cost:</span>
                                        <span>${calculatedValues.totalBaseCost.toFixed(4)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background p-2 rounded border">
                                        <span className="font-bold">Selling Price:</span>
                                        <span className="text-lg font-bold text-green-600">${calculatedValues.finalPrice.toFixed(4)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" form="costing-form">Submit for Approval</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
