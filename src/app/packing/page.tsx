"use client";

import { useState } from "react";
import {
    Package,
    Box,
    Printer,
    Barcode,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Batches Approved from QC and Ready for Packing
// Batches Approved from QC and Ready for Packing
interface PackingBatch {
    batchId: string;
    product: string;
    totalQty: number;
    packedQty: number;
    cartonSize: number;
    status: string;
}

const packingQueue: PackingBatch[] = [
    {
        batchId: "P-BATCH-2024-055",
        product: "Berry Punnet",
        totalQty: 12450,
        packedQty: 10000,
        cartonSize: 500, // pcs per carton
        status: "In Progress"
    },
    {
        batchId: "P-BATCH-2024-061",
        product: "Food Tray 500ml",
        totalQty: 50000,
        packedQty: 0,
        cartonSize: 1000,
        status: "Pending"
    }
];

export default function PackingPage() {
    const [queue, setQueue] = useState<PackingBatch[]>(packingQueue);
    const [selectedBatch, setSelectedBatch] = useState<PackingBatch | null>(null);
    const [labelOpen, setLabelOpen] = useState(false);
    const [numCartons, setNumCartons] = useState(1);
    const [verified, setVerified] = useState(false);

    const handlePackUpdate = () => {
        if (!selectedBatch) return;

        // Add 1 carton worth of qty
        const newPacked = Math.min(selectedBatch.packedQty + selectedBatch.cartonSize, selectedBatch.totalQty);
        const isComplete = newPacked >= selectedBatch.totalQty;

        setQueue((prev) => prev.map(item =>
            item.batchId === selectedBatch.batchId
                ? {
                    ...item,
                    packedQty: newPacked,
                    status: isComplete ? "Completed" : "In Progress"
                }
                : item
        ));
        setSelectedBatch((prev) => prev ? ({
            ...prev,
            packedQty: newPacked,
            status: isComplete ? "Completed" : "In Progress"
        }) : null);
    };

    const handleDispatch = () => {
        alert(`Final Dispatch Approval Requested for ${selectedBatch?.batchId}.\n\nDocuments Generated:\n- Packing List\n- Dispatch Note`);
    };

    const handleGeneratePackingList = () => {
        alert(`Packing List generated for ${selectedBatch?.batchId} containing ${Math.floor((selectedBatch?.totalQty || 0) / (selectedBatch?.cartonSize || 1))} cartons.`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Packing & Labeling</h1>
                    <p className="text-muted-foreground">
                        Carton packing, quantity verification, and dispatch clearance.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Queue List */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center">
                        <Package className="mr-2 h-5 w-5" /> Packing Queue
                    </h3>
                    {queue.map(item => (
                        <Card
                            key={item.batchId}
                            className={`cursor-pointer transition-all hover:border-primary ${selectedBatch?.batchId === item.batchId ? 'border-primary ring-1 ring-primary' : ''}`}
                            onClick={() => { setSelectedBatch(item); setVerified(false); }}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                    <CardTitle className="text-base">{item.product}</CardTitle>
                                    <Badge variant={item.status === "Completed" ? "default" : "secondary"} className={item.status === "Completed" ? "bg-green-600 hover:bg-green-700" : ""}>
                                        {item.status}
                                    </Badge>
                                </div>
                                <CardDescription>Batch: {item.batchId}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Packed: {item.packedQty.toLocaleString()} / {item.totalQty.toLocaleString()}</span>
                                        <span>{Math.round(item.packedQty / item.totalQty * 100)}%</span>
                                    </div>
                                    <Progress value={item.packedQty / item.totalQty * 100} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Workstation */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Workstation</CardTitle>
                        <CardDescription>
                            {selectedBatch ? `Processing: ${selectedBatch.product}` : "Select a batch to start packing"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedBatch ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                                    <div className="p-4 bg-muted/20 rounded-lg border">
                                        <div className="text-3xl font-bold">{selectedBatch.cartonSize}</div>
                                        <div className="text-xs text-muted-foreground">Pcs / Carton</div>
                                    </div>
                                    <div className="p-4 bg-muted/20 rounded-lg border">
                                        <div className="text-3xl font-bold text-primary">
                                            {Math.floor(selectedBatch.packedQty / selectedBatch.cartonSize)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Cartons Ready</div>
                                    </div>
                                </div>

                                {selectedBatch.status !== "Completed" ? (
                                    <div className="flex flex-col gap-3">
                                        <Button size="lg" className="w-full" onClick={handlePackUpdate}>
                                            <Box className="mr-2 h-5 w-5" />
                                            Pack Next Carton (+{selectedBatch.cartonSize})
                                        </Button>

                                        <Button variant="outline" className="w-full" onClick={() => { setVerified(false); setLabelOpen(true); }}>
                                            <Printer className="mr-2 h-5 w-5" /> Generate Carton Labels
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="flex items-center gap-2 text-green-600 font-medium justify-center">
                                            <Package className="h-5 w-5" /> Packing Complete
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <Button variant="outline" onClick={handleGeneratePackingList}>
                                                <Printer className="mr-2 h-4 w-4" /> Generate Packing List
                                            </Button>
                                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleDispatch}>
                                                <Box className="mr-2 h-4 w-4" /> Final Dispatch Approval (QC)
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                                <Barcode className="h-10 w-10 mb-2 opacity-20" />
                                <p>No Active Batch</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Label Modal */}
            <Dialog open={labelOpen} onOpenChange={setLabelOpen}>
                <DialogContent className="sm:max-w-[400px] w-[95%]">
                    <DialogHeader>
                        <DialogTitle>Print Labels</DialogTitle>
                        <DialogDescription>
                            Generate labels for: {selectedBatch?.product}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 border p-3 rounded-md bg-muted/50">
                                <input
                                    type="checkbox"
                                    id="verifyQty"
                                    className="h-4 w-4"
                                    checked={verified}
                                    onChange={(e) => setVerified(e.target.checked)}
                                />
                                <Label htmlFor="verifyQty" className="font-medium cursor-pointer">Verify Quantity & Contents</Label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Number of Labels to Print</Label>
                            <Input
                                type="number"
                                value={numCartons}
                                onChange={(e) => setNumCartons(Number(e.target.value))}
                                min={1}
                            />
                            <p className="text-xs text-muted-foreground">
                                Standard: 4x6 inch thermal label
                            </p>
                        </div>

                        <div className="border border-dashed p-4 rounded-lg bg-white text-black flex flex-col items-center shadow-sm">
                            <div className="w-full flex justify-between items-center mb-2">
                                <span className="font-bold text-sm">POLYTRACK</span>
                                <span className="text-[10px]">CARTON: 1 of {numCartons}</span>
                            </div>
                            <h3 className="font-bold text-lg">{selectedBatch?.product}</h3>
                            <p className="text-xs mb-2">Batch: {selectedBatch?.batchId}</p>
                            <Barcode className="h-12 w-full" />
                            <p className="text-xs mt-1 text-center font-mono">{selectedBatch?.batchId}-001</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button className="w-full" onClick={() => setLabelOpen(false)} disabled={!verified}>
                            <Printer className="mr-2 h-4 w-4" /> Print {numCartons} Labels
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
