"use client";

import { useState } from "react";
import {
    ShoppingCart,
    CheckCircle2,
    PackageSearch,
    Truck,
    ClipboardCheck
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Mock Requisitions
const requisitions = [
    {
        reqId: "REQ-001",
        material: "PET Sheet Roll",
        grade: "Food Grade 0.5mm",
        quantity: "2000 kg",
        requiredBy: "2024-02-10",
        status: "Pending PO"
    },
    {
        reqId: "REQ-002",
        material: "HIPS Granules",
        grade: "White 455",
        quantity: "500 kg",
        requiredBy: "2024-02-12",
        status: "Ordered"
    }
];

interface InwardBatch {
    batchId: string;
    item: string;
    supplier: string;
    recvDate: string;
    qty: string;
    status: string;
}

// Mock Inward Goods for QC
const inwardBatches: InwardBatch[] = [
    {
        batchId: "B-IN-8821",
        item: "PET Sheet Roll",
        supplier: "Polymex Ind.",
        recvDate: "2024-02-01",
        qty: "2000 kg",
        status: "Pending QC"
    },
    {
        batchId: "B-IN-8805",
        item: "PVC Film",
        supplier: "Vinyl Corp",
        recvDate: "2024-01-28",
        qty: "1500 kg",
        status: "Approved"
    }
];

export default function ProcurementPage() {
    const [reqs, setReqs] = useState(requisitions);
    const [batches, setBatches] = useState(inwardBatches);
    const [qcOpen, setQcOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<InwardBatch | null>(null);

    const handleQC = (batch: InwardBatch) => {
        setSelectedBatch(batch);
        setQcOpen(true);
    };

    const handleRaisePO = (reqId: string) => {
        setReqs(reqs.map(r => r.reqId === reqId ? { ...r, status: "Ordered" } : r));
        alert(`Purchase Order generated for ${reqId} sent to supplier.`);
    };

    const handleQCSubmit = (decision: 'Approved' | 'Rejected') => {
        if (!selectedBatch) return;

        if (decision === 'Approved') {
            alert(`Batch ${selectedBatch.batchId} APPROVED.\n\nMaterial added to Approved RM Stock.\nReady for Production.`);
        } else {
            alert(`Batch ${selectedBatch.batchId} REJECTED.\n\nReturn Note Generated for Supplier.`);
        }

        setBatches(batches.map(b => b.batchId === selectedBatch.batchId ? { ...b, status: decision } : b));
        setQcOpen(false);
    };

    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Procurement & QC (RM)</h1>
                    <p className="text-muted-foreground">
                        Manage raw material purchasing (PET, PVC, HIPS) and inward quality inspection.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="procurement" className="space-y-4">
                <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-muted/50 p-2">
                    <TabsTrigger value="procurement" className="flex-1 sm:flex-none">Material Procurement</TabsTrigger>
                    <TabsTrigger value="qc" className="flex-1 sm:flex-none">Inward QC</TabsTrigger>
                </TabsList>

                {/* Procurement Tab */}
                <TabsContent value="procurement">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2 min-w-0">
                            <CardHeader>
                                <CardTitle>Open Requisitions</CardTitle>
                                <CardDescription>Generated from production plans</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto w-full max-w-[85vw] sm:max-w-full">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="whitespace-nowrap">Req ID</TableHead>
                                                <TableHead className="whitespace-nowrap">Material</TableHead>
                                                <TableHead className="whitespace-nowrap">Qty</TableHead>
                                                <TableHead className="whitespace-nowrap">Required By</TableHead>
                                                <TableHead className="whitespace-nowrap">Status</TableHead>
                                                <TableHead className="whitespace-nowrap">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reqs.map(req => (
                                                <TableRow key={req.reqId}>
                                                    <TableCell className="font-medium whitespace-nowrap">{req.reqId}</TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span>{req.material}</span>
                                                            <span className="text-xs text-muted-foreground">{req.grade}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">{req.quantity}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{req.requiredBy}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={req.status === 'Pending PO' ? 'secondary' : 'outline'}>
                                                            {req.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {req.status === 'Pending PO' && (
                                                            <Button size="sm" variant="outline" onClick={() => handleRaisePO(req.reqId)}>Raise PO</Button>
                                                        )}
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
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button className="w-full justify-start" variant="outline">
                                    <ShoppingCart className="mr-2 h-4 w-4" /> Create Manual PO
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <PackageSearch className="mr-2 h-4 w-4" /> View Supplier List
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <Truck className="mr-2 h-4 w-4" /> Material Receipt Note (GRN)
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Inward QC Tab */}
                <TabsContent value="qc">
                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle>Inward Quality Inspection Queue</CardTitle>
                            <CardDescription>Validate received raw materials before stock entry.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto w-full max-w-[85vw] sm:max-w-full">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="whitespace-nowrap">Batch ID</TableHead>
                                            <TableHead className="whitespace-nowrap">Item Details</TableHead>
                                            <TableHead className="whitespace-nowrap">Supplier</TableHead>
                                            <TableHead className="whitespace-nowrap">Received</TableHead>
                                            <TableHead className="whitespace-nowrap">Status</TableHead>
                                            <TableHead className="whitespace-nowrap">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {batches.map(batch => (
                                            <TableRow key={batch.batchId}>
                                                <TableCell className="font-medium whitespace-nowrap">{batch.batchId}</TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <div className="font-medium">{batch.item}</div>
                                                    <div className="text-xs text-muted-foreground">{batch.qty}</div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">{batch.supplier}</TableCell>
                                                <TableCell className="whitespace-nowrap">{batch.recvDate}</TableCell>
                                                <TableCell>
                                                    <Badge variant={batch.status === 'Approved' ? 'default' : batch.status === 'Rejected' ? 'destructive' : 'secondary'} className={batch.status === 'Approved' ? 'bg-green-600' : ''}>
                                                        {batch.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {batch.status === 'Pending QC' && (
                                                        <Button size="sm" onClick={() => handleQC(batch)}>
                                                            <ClipboardCheck className="mr-2 h-4 w-4" /> Inspect
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* QC Inspection Dialog */}
            <Dialog open={qcOpen} onOpenChange={setQcOpen}>
                <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>QC Inspection: {selectedBatch?.batchId}</DialogTitle>
                        <DialogDescription>
                            {selectedBatch?.item} from {selectedBatch?.supplier}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Thickness Checked (mm)</Label>
                                <Input placeholder="Avg. measured" />
                            </div>
                            <div className="space-y-2">
                                <Label>GSM Checked</Label>
                                <Input placeholder="Avg. measured" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Visual Defects?</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select outcome" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None - Clean</SelectItem>
                                    <SelectItem value="minor">Minor Scratches (Acceptable)</SelectItem>
                                    <SelectItem value="major">Major Damage (Reject)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 border-t pt-2 mt-2">
                            <Label className="flex items-center space-x-2">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                                <span>Compliance verified (Food/Pharma Grade)</span>
                            </Label>
                        </div>
                        <div className="space-y-2">
                            <Label>Remarks</Label>
                            <Textarea placeholder="Inspector notes..." />
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="destructive" className="w-full sm:w-auto" onClick={() => handleQCSubmit('Rejected')}>Reject Material</Button>
                        <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" onClick={() => handleQCSubmit('Approved')}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Approve & Move to Stock
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
