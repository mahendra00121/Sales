"use client";

import { useState } from "react";
import {
    CheckCircle,
    XCircle,
    Search,
    FileCheck2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// Mock Batches ready for FQC
interface QCBatch {
    batchId: string;
    product: string;
    qty: number;
    prodDate: string;
    machine: string;
    status: string;
}

const pendingBatches: QCBatch[] = [
    {
        batchId: "B-2024-055",
        product: "Berry Punnet 250g",
        qty: 12500,
        prodDate: "2024-02-14",
        machine: "TF-02",
        status: "Pending FQC"
    },
    {
        batchId: "B-2024-052",
        product: "Salad Bowl Lid",
        qty: 8000,
        prodDate: "2024-02-13",
        machine: "TF-01",
        status: "Hold"
    }
];

export default function FinalQCPage() {
    const [batches, setBatches] = useState<QCBatch[]>(pendingBatches);
    const [selectedBatch, setSelectedBatch] = useState<QCBatch | null>(null);
    const [inspectOpen, setInspectOpen] = useState(false);

    // Inspection Form State
    const [checks, setChecks] = useState({
        dimensions: false,
        strength: false,
        visual: false,
        stacking: false,
        labeling: false,
        traceability: false,
        customerParams: false
    });
    const [status, setStatus] = useState<"Approved" | "Rejected" | "Hold">("Approved");
    const [remarks, setRemarks] = useState("");

    const handleInspect = (batch: QCBatch) => {
        setSelectedBatch(batch);
        setChecks({
            dimensions: false,
            strength: false,
            visual: false,
            stacking: false,
            labeling: false,
            traceability: false,
            customerParams: false
        });
        setStatus("Approved");
        setRemarks("");
        setInspectOpen(true);
    };

    const handleSubmit = () => {
        if (!selectedBatch) return;

        if (status === 'Approved') {
            alert(`Batch ${selectedBatch.batchId} APPROVED for Packing.\n\nDocuments Generated:\n- Inspection Report\n- Certificate of Analysis (COA)`);
        } else {
            alert(`Batch ${selectedBatch.batchId} marked as ${status.toUpperCase()}.\n\nProcess triggered: ${status === 'Rejected' ? 'Scrap Report' : 'Rework Order'}`);
        }

        setBatches(batches.map(b => b.batchId === selectedBatch.batchId ? { ...b, status: status } : b));
        setInspectOpen(false);
    };

    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Final Quality Inspection</h1>
                    <p className="text-muted-foreground">
                        Finished goods verification, batch release, and COA generation.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 min-w-0">
                    <CardHeader>
                        <CardTitle>Batches Awaiting Release</CardTitle>
                        <CardDescription>Select a batch to perform final inspection.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto w-full max-w-[85vw] sm:max-w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">Batch ID</TableHead>
                                        <TableHead className="whitespace-nowrap">Product</TableHead>
                                        <TableHead className="whitespace-nowrap">Qty</TableHead>
                                        <TableHead className="whitespace-nowrap">MFG Date</TableHead>
                                        <TableHead className="whitespace-nowrap">Status</TableHead>
                                        <TableHead className="whitespace-nowrap">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batches.map(batch => (
                                        <TableRow key={batch.batchId}>
                                            <TableCell className="font-medium whitespace-nowrap">{batch.batchId}</TableCell>
                                            <TableCell className="whitespace-nowrap">{batch.product}</TableCell>
                                            <TableCell className="whitespace-nowrap">{batch.qty.toLocaleString()}</TableCell>
                                            <TableCell className="whitespace-nowrap">{batch.prodDate}</TableCell>
                                            <TableCell>
                                                <Badge variant={batch.status === 'Approved' ? 'default' : batch.status === 'Rejected' ? 'destructive' : 'secondary'}
                                                    className={batch.status === 'Hold' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : ''}
                                                >
                                                    {batch.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="outline" onClick={() => handleInspect(batch)}>
                                                    <Search className="mr-2 h-4 w-4" /> Inspect
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>QC Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Passed Today</p>
                                <p className="text-2xl font-bold text-green-600">4 Batches</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-100 fill-green-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                                <p className="text-2xl font-bold text-red-600">0 Batches</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-100 fill-red-600" />
                        </div>
                        <div className="pt-4 border-t">
                            <Button className="w-full" variant="secondary">
                                <FileCheck2 className="mr-2 h-4 w-4" /> View COA Archive
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* QC Inspection Modal */}
            <Dialog open={inspectOpen} onOpenChange={setInspectOpen}>
                <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Inspect Batch: {selectedBatch?.batchId}</DialogTitle>
                        <DialogDescription>
                            {selectedBatch?.product} • Qty: {selectedBatch?.qty}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                            <h4 className="font-semibold text-sm">Checklist (Step 8 Verified)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="c1" checked={checks.dimensions} onCheckedChange={(c) => setChecks({ ...checks, dimensions: !!c })} />
                                    <Label htmlFor="c1" className="text-sm cursor-pointer">Dimensional Check</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="c2" checked={checks.strength} onCheckedChange={(c) => setChecks({ ...checks, strength: !!c })} />
                                    <Label htmlFor="c2" className="text-sm cursor-pointer">Strength / Drop Test</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="c3" checked={checks.visual} onCheckedChange={(c) => setChecks({ ...checks, visual: !!c })} />
                                    <Label htmlFor="c3" className="text-sm cursor-pointer">Visual (Color/Clarity)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="c4" checked={checks.stacking} onCheckedChange={(c) => setChecks({ ...checks, stacking: !!c })} />
                                    <Label htmlFor="c4" className="text-sm cursor-pointer">Stacking Fitment</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="c6" checked={checks.traceability} onCheckedChange={(c) => setChecks({ ...checks, traceability: !!c })} />
                                    <Label htmlFor="c6" className="text-sm cursor-pointer whitespace-nowrap">Batch Traceability (Verified)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="c7" checked={checks.customerParams} onCheckedChange={(c) => setChecks({ ...checks, customerParams: !!c })} />
                                    <Label htmlFor="c7" className="text-sm cursor-pointer">Customer-Specific Params</Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Decision</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={status === 'Approved' ? 'default' : 'outline'}
                                    className={status === 'Approved' ? "bg-green-600 hover:bg-green-700" : ""}
                                    onClick={() => setStatus('Approved')}
                                >
                                    Pass / Approve
                                </Button>
                                <Button
                                    type="button"
                                    variant={status === 'Rejected' ? 'destructive' : 'outline'}
                                    onClick={() => setStatus('Rejected')}
                                >
                                    Reject
                                </Button>
                                <Button
                                    type="button"
                                    variant={status === 'Hold' ? 'secondary' : 'outline'}
                                    className={status === 'Hold' ? "bg-yellow-100 text-yellow-800" : ""}
                                    onClick={() => setStatus('Hold')}
                                >
                                    Hold
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Remarks / COA Notes</Label>
                            <Textarea
                                placeholder="Enter measured values or rejection reason..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setInspectOpen(false)}>Cancel</Button>
                        <Button className="w-full sm:w-auto" onClick={handleSubmit}>Submit Report</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
