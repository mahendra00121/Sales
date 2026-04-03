"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle,
    XCircle,
    Search,
    FileCheck2,
    Loader2,
    ClipboardList,
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

// --- Updated Types to match Backend ---
interface ProductionBatch {
    id: number;
    batchNumber: string;
    actualQuantityProduced: number;
    wasteQuantity: number;
    productionPlan?: {
        order?: {
            inquiry?: {
                customerName: string;
                description: string;
            }
        }
    }
}

interface QCReport {
    id: number;
    productionRecordId: number;
    qcIncharge: string;
    testDate: string;
    outcome: string;
    testedQuantity: number;
    passedQuantity: number;
    rejectedQuantity: number;
    qcNotes: string;
}

export default function FinalQCPage() {
    const [batches, setBatches] = useState<ProductionBatch[]>([]);
    const [reports, setReports] = useState<QCReport[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
    const [inspectOpen, setInspectOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [checks, setChecks] = useState({ dimensions: false, strength: false, visual: false, stacking: false });
    const [status, setStatus] = useState<"Pass" | "Fail" | "Rework">("Pass");
    const [remarks, setRemarks] = useState("");

    const fetchData = async () => {
        try {
            // Fetch from ShopFloor (Actual production logs)
            const floorRes = await fetch("http://localhost:5278/api/ShopFloor");
            const allBatches: ProductionBatch[] = await floorRes.json();
            setBatches(allBatches);

            const qcRes = await fetch("http://localhost:5278/api/FinalQC");
            const allQC: QCReport[] = await qcRes.json();
            setReports(allQC.sort((a,b) => b.id - a.id));
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInspect = (batch: ProductionBatch) => {
        setSelectedBatch(batch);
        setChecks({ dimensions: false, strength: false, visual: false, stacking: false });
        setStatus("Pass");
        setRemarks("");
        setInspectOpen(true);
    };

    const handleSubmit = async () => {
        if (!selectedBatch) return;
        setIsLoading(true);

        try {
            const payload = {
                productionRecordId: selectedBatch.id,
                batchNumber: selectedBatch.batchNumber,
                qcIncharge: "Senior QC Lead",
                testedQuantity: selectedBatch.actualQuantityProduced,
                passedQuantity: status === 'Pass' ? selectedBatch.actualQuantityProduced : 0,
                rejectedQuantity: status === 'Fail' ? selectedBatch.actualQuantityProduced : 0,
                outcome: status,
                testDate: new Date(),
                qcNotes: remarks
            };

            const response = await fetch("http://localhost:5278/api/FinalQC", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchData();
                setInspectOpen(false);
            } else {
                alert("QC Report submission failed");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-rose-900 border-l-4 border-l-rose-500 pl-4">Final Technical Inspection</h1>
                    <p className="text-muted-foreground ml-4">Analyze shop floor batches and certify quality compliance.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                <Card className="md:col-span-8 shadow-lg">
                    <CardHeader className="bg-rose-50/50 border-b">
                        <CardTitle className="text-rose-900 flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Production Batches</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Produced Qty</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isFetching ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin inline" /></TableCell></TableRow>
                                ) : (
                                    batches.map(batch => (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-bold text-rose-700">{batch.batchNumber}</TableCell>
                                            <TableCell>{batch.productionPlan?.order?.inquiry?.customerName || "Stock Item"}</TableCell>
                                            <TableCell className="font-medium">{batch.actualQuantityProduced.toLocaleString()} Pcs</TableCell>
                                            <TableCell>
                                                <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={() => handleInspect(batch)}>
                                                    Inspect
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="md:col-span-4 h-fit shadow-md border-t-4 border-t-rose-600">
                    <CardHeader><CardTitle className="text-lg">QC Performance</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex justify-between items-center">
                            <div><p className="text-xs font-bold text-green-600">PASSED</p><p className="text-3xl font-black">{reports.filter(r => r.outcome === 'Pass').length}</p></div>
                            <CheckCircle className="h-10 w-10 text-green-400 opacity-50" />
                        </div>
                        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex justify-between items-center">
                            <div><p className="text-xs font-bold text-rose-600">FAILED/REWORK</p><p className="text-3xl font-black">{reports.filter(r => r.outcome !== 'Pass').length}</p></div>
                            <XCircle className="h-10 w-10 text-rose-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={inspectOpen} onOpenChange={setInspectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>QC Analysis: {selectedBatch?.batchNumber}</DialogTitle>
                        <DialogDescription>Produced Quantity: {selectedBatch?.actualQuantityProduced.toLocaleString()} Pcs</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border rounded-2xl">
                             <div className="flex items-center space-x-2">
                                <Checkbox id="c1" checked={checks.dimensions} onCheckedChange={(c) => setChecks({ ...checks, dimensions: !!c })} />
                                <Label htmlFor="c1" className="text-sm font-semibold">Dimensions</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="c2" checked={checks.strength} onCheckedChange={(c) => setChecks({ ...checks, strength: !!c })} />
                                <Label htmlFor="c2" className="text-sm font-semibold">Strength</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="c3" checked={checks.visual} onCheckedChange={(c) => setChecks({ ...checks, visual: !!c })} />
                                <Label htmlFor="c3" className="text-sm font-semibold">Visual</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="c4" checked={checks.stacking} onCheckedChange={(c) => setChecks({ ...checks, stacking: !!c })} />
                                <Label htmlFor="c4" className="text-sm font-semibold">Stacking</Label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="font-bold">Decision Outcome</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <Button variant={status === 'Pass' ? 'default' : 'outline'} className={status === 'Pass' ? "bg-green-600" : ""} onClick={() => setStatus('Pass')}>PASS</Button>
                                <Button variant={status === 'Rework' ? 'default' : 'outline'} className={status === 'Rework' ? "bg-orange-500" : ""} onClick={() => setStatus('Rework')}>REWORK</Button>
                                <Button variant={status === 'Fail' ? 'default' : 'outline'} className={status === 'Fail' ? "bg-rose-600" : ""} onClick={() => setStatus('Fail')}>FAIL</Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold">Inspector Notes</Label>
                            <Textarea placeholder="Measured weight or rejection reason..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button className="w-full bg-rose-800 hover:bg-rose-900 py-6 text-lg font-bold" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : "Save Report & Certify Batch"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
