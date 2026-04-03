"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Check,
    ArrowRight,
    FileCheck,
    Cog,
    HardHat,
    Loader2
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// --- Types ---
interface Inquiry {
    id: number;
    customerName: string;
    description: string;
    status: string;
    inquiryDate: string;
}

interface ReviewData {
    id: number;
    inquiryId: number;
    isFeasible: boolean;
    technicalNotes: string;
    estimatedProcessDays: number;
    reviewedBy: string;
    reviewDate: string;
    status: string;
    inquiry?: Inquiry;
}

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
    const [pendingInquiries, setPendingInquiries] = useState<Inquiry[]>([]);
    const [completedReviews, setCompletedReviews] = useState<ReviewData[]>([]);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

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

    // 1. Fetch Data from Backend
    const fetchData = async () => {
        try {
            // Fetch All Inquiries
            const inqRes = await fetch("http://localhost:5278/api/SalesInquiry");
            const allInq: Inquiry[] = await inqRes.json();
            // Filter only "New" status for pending
            setPendingInquiries(allInq.filter(i => i.status === "New"));

            // Fetch Recent Reviews
            const reviewRes = await fetch("http://localhost:5278/api/FeasibilityReview");
            const reviews: ReviewData[] = await reviewRes.json();
            setCompletedReviews(reviews.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStartReview = (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        form.reset();
        setOpen(true);
    };

    const onSubmit = async (data: ReviewFormValues) => {
        if (!selectedInquiry) return;
        setIsLoading(true);

        const isFeasible = data.materialAvailable && data.machineAvailable && data.drawingsReviewed;

        try {
            const payload = {
                inquiryId: selectedInquiry.id,
                isFeasible: isFeasible,
                technicalNotes: `${data.remarks || ""}. Mold: ${data.moldStatus} (${data.moldDetails || "N/A"}). CycleTime: ${data.cycleTime}s, Yield: ${data.yieldEstimate}%`,
                estimatedProcessDays: 7, // Default estimation
                reviewedBy: "Admin Engineer",
                status: isFeasible ? "Approved" : "Rejected"
            };

            const response = await fetch("http://localhost:5278/api/FeasibilityReview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchData(); // Refresh both lists
                setOpen(false);
                setSelectedInquiry(null);
            } else {
                alert("Failed to submit review");
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Error connecting to server");
        } finally {
            setIsLoading(false);
        }
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
                <Card className="col-span-1 border-l-4 border-l-yellow-500 shadow-sm">
                    <CardHeader>
                        <CardTitle>Pending Reviews</CardTitle>
                        <CardDescription>Inquiries awaiting technical check</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isFetching ? (
                            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-teal-600" /></div>
                        ) : pendingInquiries.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-10">No new inquiries.</p>
                        ) : (
                            pendingInquiries.map((inq) => (
                                <div
                                    key={inq.id}
                                    className="p-4 rounded-lg border bg-card hover:bg-teal-50 transition-colors cursor-pointer group"
                                    onClick={() => handleStartReview(inq)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="bg-white">INQ-{inq.id.toString().padStart(4, '0')}</Badge>
                                        <span className="text-xs text-muted-foreground">{format(new Date(inq.inquiryDate), "dd MMM")}</span>
                                    </div>
                                    <h4 className="font-semibold text-teal-900">{inq.customerName}</h4>
                                    <p className="text-sm text-muted-foreground truncate">{inq.description}</p>
                                    <div className="mt-3 flex items-center justify-between text-xs">
                                        <span className="bg-white border px-2 py-1 rounded text-teal-700">Detailed Review Req.</span>
                                        <span className="font-medium text-teal-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            Assess <ArrowRight className="h-3 w-3" />
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Completed Reviews Log */}
                <Card className="col-span-1 md:col-span-2 shadow-sm border-t-4 border-t-teal-600">
                    <CardHeader>
                        <CardTitle>Feasibility Logs</CardTitle>
                        <CardDescription>Database records of recently processed feasibilities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[500px] pr-4">
                            {isFetching ? (
                                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-teal-600" /></div>
                            ) : completedReviews.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground opacity-50 border-2 border-dashed rounded-lg">
                                    <FileCheck className="h-10 w-10 mb-2" />
                                    <p>No reviews found in database.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {completedReviews.map((review) => (
                                        <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-teal-800">INQ-{review.inquiryId.toString().padStart(4, '0')}</span>
                                                    <Badge className={cn(
                                                        review.isFeasible ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"
                                                    )}>
                                                        {review.isFeasible ? "Feasible" : "Not Feasible"}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-medium mt-1">{review.inquiry?.customerName || "Customer"}</p>
                                                <p className="text-xs text-muted-foreground italic mt-1 max-w-[400px] truncate">{review.technicalNotes}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold text-teal-600">{review.reviewedBy}</p>
                                                <p className="text-[10px] text-muted-foreground">{format(new Date(review.reviewDate), "dd MMM yyyy HH:mm")}</p>
                                            </div>
                                        </div>
                                    ))}
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
                            Technical Review: INQ-{selectedInquiry?.id.toString().padStart(4, '0')}
                        </DialogTitle>
                        <DialogDescription>
                            Assess production capability for {selectedInquiry?.customerName}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Engineering</Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Production</Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">QC</Badge>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                        <Label htmlFor="dwg-review" className="cursor-pointer">Drawings / Samples Reviewed & Validated</Label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Est. Cycle Time (sec)</Label>
                                    <Input type="number" step="0.1" {...form.register("cycleTime")} placeholder="e.g. 15.5" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Est. Production Yield (%)</Label>
                                    <Input type="number" step="1" {...form.register("yieldEstimate")} placeholder="e.g. 95" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Technical Remarks & Decision Notes</Label>
                                <Textarea {...form.register("remarks")} placeholder="Any concerns or special instructions..." />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`${form.watch("materialAvailable") && form.watch("machineAvailable") && form.watch("drawingsReviewed")
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                        }`}
                                >
                                    {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                                        form.watch("materialAvailable") && form.watch("machineAvailable") && form.watch("drawingsReviewed")
                                            ? <><Check className="mr-2 h-4 w-4" /> Approve Feasibility</>
                                            : <><ArrowRight className="mr-2 h-4 w-4" /> Submit as Not Feasible</>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
