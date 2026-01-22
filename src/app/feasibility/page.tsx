"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Check,
    ArrowRight,
    FileCheck,
    Cog,
    HardHat
} from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";


// Mock Data
interface Inquiry {
    id: string;
    customer: string;
    product: string;
    material: string;
    quantity: number;
    date: string;
    status: "Pending" | "Feasible" | "Not Feasible";
}

const initialInquiries: Inquiry[] = [
    {
        id: "INQ-2024-001",
        customer: "Acme Corp",
        product: "Food Tray 500ml",
        material: "PET",
        quantity: 50000,
        date: "2024-01-15",
        status: "Pending",
    },
    {
        id: "INQ-2024-004",
        customer: "Global Pharma",
        product: "Vial Blister",
        material: "PVC",
        quantity: 120000,
        date: "2024-01-20",
        status: "Pending",
    },
];

// --- Form Schema ---
const reviewSchema = z.object({
    moldStatus: z.enum(["existing", "new"]),
    moldDetails: z.string().optional(),
    materialAvailable: z.boolean(),
    machineAvailable: z.boolean(),
    drawingsReviewed: z.boolean(),
    cycleTime: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Cycle time must be a positive number",
    }),
    yieldEstimate: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100, {
        message: "Yield must be between 1 and 100",
    }),
    remarks: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function FeasibilityPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [open, setOpen] = useState(false);

    // State for storing completed reviews (mock database)
    interface ReviewData extends ReviewFormValues {
        inquiryId: string;
        reviewDate: Date;
        status: "Feasible" | "Not Feasible";
    }
    const [completedReviews, setCompletedReviews] = useState<ReviewData[]>([]);

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            moldStatus: "existing",
            materialAvailable: false,
            machineAvailable: false,
            drawingsReviewed: false,
            cycleTime: "",
            yieldEstimate: "",
            remarks: "",
            moldDetails: "",
        },
    });

    const handleStartReview = (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        // Reset form for new review, potentially pre-filling if we had draft data
        form.reset({
            moldStatus: "existing",
            materialAvailable: false,
            machineAvailable: false,
            drawingsReviewed: false,
            cycleTime: "",
            yieldEstimate: "",
            remarks: "",
            moldDetails: "",
        });
        setOpen(true);
    };

    const onSubmit = (data: ReviewFormValues) => {
        if (!selectedInquiry) return;

        // Determine Feasibility Logic
        const isFeasible = data.materialAvailable && data.machineAvailable && data.drawingsReviewed;

        // Cast to literal type to satisfy TypeScript
        const newStatus: "Feasible" | "Not Feasible" = isFeasible ? "Feasible" : "Not Feasible";

        const updatedInquiries = inquiries.map((favorites) =>
            favorites.id === selectedInquiry.id ? { ...favorites, status: newStatus } : favorites
        );

        setInquiries(updatedInquiries);
        setCompletedReviews([
            ...completedReviews,
            {
                ...data,
                inquiryId: selectedInquiry.id,
                reviewDate: new Date(),
                status: newStatus,
            },
        ]);

        setOpen(false);
        setSelectedInquiry(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Feasibility Review</h1>
                    <p className="text-muted-foreground">
                        Technical & commercial assessment of new sales inquiries.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pending Inquiries List */}
                <Card className="col-span-1 border-l-4 border-l-yellow-500">
                    <CardHeader>
                        <CardTitle>Pending Reviews</CardTitle>
                        <CardDescription>Inquiries awaiting technical check</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {inquiries.filter(inq => inq.status === 'Pending').length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No pending inquiries.</p>
                        ) : (
                            inquiries
                                .filter((inq) => inq.status === "Pending")
                                .map((inq) => (
                                    <div
                                        key={inq.id}
                                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handleStartReview(inq)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline">{inq.id}</Badge>
                                            <span className="text-xs text-muted-foreground">{inq.date}</span>
                                        </div>
                                        <h4 className="font-semibold">{inq.customer}</h4>
                                        <p className="text-sm text-muted-foreground">{inq.product}</p>
                                        <div className="mt-3 flex items-center justify-between text-xs">
                                            <span className="bg-muted px-2 py-1 rounded">{inq.material}</span>
                                            <span className="font-medium text-primary flex items-center gap-1">
                                                Review <ArrowRight className="h-3 w-3" />
                                            </span>
                                        </div>
                                    </div>
                                ))
                        )}

                    </CardContent>
                </Card>

                {/* Completed Reviews Log */}
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Review Log (Session)</CardTitle>
                        <CardDescription>Recently processed feasibilities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            {completedReviews.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground opacity-50 border-2 border-dashed rounded-lg">
                                    <FileCheck className="h-10 w-10 mb-2" />
                                    <p>No reviews completed yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {completedReviews.map((review, idx) => {
                                        const originalInq = initialInquiries.find(i => i.id === review.inquiryId) || inquiries.find(i => i.id === review.inquiryId);
                                        return (
                                            <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">{review.inquiryId}</span>
                                                        <Badge variant={review.status === "Feasible" ? "default" : "destructive"}>
                                                            {review.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {originalInq?.customer} - {originalInq?.product}
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs text-muted-foreground">Cycle Time: {review.cycleTime}s</span>
                                                        <span className="text-xs text-muted-foreground">Yield: {review.yieldEstimate}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Feasibility Review Dialog Form */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[700px] w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HardHat className="h-5 w-5 text-orange-600" />
                            Technical Review: {selectedInquiry?.id}
                        </DialogTitle>
                        <DialogDescription>
                            Assess production capability for {selectedInquiry?.product} ({selectedInquiry?.material}).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Engineering & Production</Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Quality</Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Sales</Badge>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Section 1: Mold Assessment (Engineering) */}
                            <div className="space-y-3 border p-4 rounded-lg bg-muted/20">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <Cog className="h-4 w-4" /> 1. Mold Assessment (Engineering)
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Mold Status</Label>
                                        <RadioGroup
                                            defaultValue="existing"
                                            onValueChange={(val) => form.setValue("moldStatus", val as "existing" | "new")}
                                            className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="existing" id="m-exist" />
                                                <Label htmlFor="m-exist">Existing Mold Available</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="new" id="m-new" />
                                                <Label htmlFor="m-new">New Mold Development Required</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    {form.watch("moldStatus") === "new" && (
                                        <div className="space-y-2">
                                            <Label>Development Notes (Lead time, Cost est.)</Label>
                                            <Input {...form.register("moldDetails")} placeholder="e.g. 4 Weeks, $2500 est." />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 2: Resource Checks (Production & Sales) */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <Check className="h-4 w-4" /> 2. Resource Availability Checks
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2 border p-3 rounded hover:bg-muted/50 transition-colors">
                                        <Checkbox
                                            id="mat-avail"
                                            checked={form.watch("materialAvailable")}
                                            onCheckedChange={(checked) => form.setValue("materialAvailable", checked === true)}
                                        />
                                        <Label htmlFor="mat-avail" className="cursor-pointer">Material Grade Available</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border p-3 rounded hover:bg-muted/50 transition-colors">
                                        <Checkbox
                                            id="mach-avail"
                                            checked={form.watch("machineAvailable")}
                                            onCheckedChange={(checked) => form.setValue("machineAvailable", checked === true)}
                                        />
                                        <Label htmlFor="mach-avail" className="cursor-pointer">Machine Capacity Available</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border p-3 rounded col-span-1 md:col-span-2 hover:bg-muted/50 transition-colors">
                                        <Checkbox
                                            id="dwg-review"
                                            checked={form.watch("drawingsReviewed")}
                                            onCheckedChange={(checked) => form.setValue("drawingsReviewed", checked === true)}
                                        />
                                        <Label htmlFor="dwg-review" className="cursor-pointer">Drawings / Samples Reviewed & Validated (QC/Eng)</Label>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Costing Inputs (Output) */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2 text-green-700">
                                    <FileCheck className="h-4 w-4" /> 3. Costing Inputs (Output)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Est. Cycle Time (sec)</Label>
                                        <Input type="number" step="0.1" {...form.register("cycleTime")} placeholder="e.g. 15.5" />
                                        {form.formState.errors.cycleTime && <span className="text-xs text-red-500">{form.formState.errors.cycleTime.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Est. Production Yield (%)</Label>
                                        <Input type="number" step="1" {...form.register("yieldEstimate")} placeholder="e.g. 95" />
                                        {form.formState.errors.yieldEstimate && <span className="text-xs text-red-500">{form.formState.errors.yieldEstimate.message}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Technical Remarks & Decision Notes</Label>
                                <Textarea {...form.register("remarks")} placeholder="Any concerns or special instructions..." />
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
                                <div className="mr-auto flex items-center gap-2 text-sm text-muted-foreground italic">
                                    * Approval requires all checks passed
                                </div>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button
                                    type="submit"
                                    className={`${form.watch("materialAvailable") && form.watch("machineAvailable") && form.watch("drawingsReviewed")
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                        }`}
                                >
                                    {form.watch("materialAvailable") && form.watch("machineAvailable") && form.watch("drawingsReviewed")
                                        ? <><Check className="mr-2 h-4 w-4" /> Approve Feasibility</>
                                        : <><ArrowRight className="mr-2 h-4 w-4" /> Submit as Not Feasible</>
                                    }
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
