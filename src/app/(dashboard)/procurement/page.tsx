"use client";

import { useState, useEffect } from "react";
import {
    ShoppingCart,
    CheckCircle2,
    PackageSearch,
    Truck,
    ClipboardCheck,
    Loader2,
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

// --- Updated Types to match Backend ---
interface ProcurementRecord {
    id: number;
    itemName: string;
    vendorName: string;
    quantity: number;
    unit: string;
    expectedDate: string;
    qcStatus: string;
    purchaseOrderNumber: string;
}

export default function ProcurementPage() {
    const [procurements, setProcurements] = useState<ProcurementRecord[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    
    const [qcOpen, setQcOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<ProcurementRecord | null>(null);

    // Form states
    const [newItemName, setNewItemName] = useState("PET Sheet Roll");
    const [newVendor, setNewVendor] = useState("");
    const [newQty, setNewQty] = useState(0);

    const fetchData = async () => {
        try {
            const res = await fetch("http://localhost:5278/api/Procurement");
            const data: ProcurementRecord[] = await res.json();
            setProcurements(data.sort((a,b) => b.id - a.id));
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRaisePO = async () => {
        if (!newVendor || newQty <= 0) return;
        setIsLoading(true);

        try {
            const payload = {
                itemName: newItemName,
                vendorName: newVendor,
                quantity: newQty,
                unit: "kg",
                expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                qcStatus: "Pending",
                purchaseOrderNumber: `PO-${Date.now().toString().slice(-6)}`
            };

            const response = await fetch("http://localhost:5278/api/Procurement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchData();
                setNewVendor("");
                setNewQty(0);
            } else {
                alert("Procurement request failed");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQCSubmit = async (decision: 'Approved' | 'Rejected') => {
        if (!selectedBatch) return;
        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:5278/api/Procurement/${selectedBatch.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...selectedBatch,
                    qcStatus: decision
                }),
            });

            if (response.ok) {
                await fetchData();
                setQcOpen(false);
            }
        } catch (error) {
            console.error("QC error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-emerald-900">Procurement & QC</h1>
                    <p className="text-muted-foreground">
                        Manage supply chain for PET, PVC, HIPS and technical quality inspections.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="procurement" className="space-y-4">
                <TabsList className="bg-emerald-50 border-emerald-100">
                    <TabsTrigger value="procurement" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Material Procurement</TabsTrigger>
                    <TabsTrigger value="qc" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Inward QC Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="procurement" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-12">
                        <Card className="md:col-span-4 shadow-md border-t-4 border-t-emerald-600">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-emerald-600" /> Raise Purchase Order</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Material Type</Label>
                                    <Select defaultValue="PET Sheet Roll" onValueChange={setNewItemName}>
                                        <SelectTrigger><SelectValue placeholder="Material" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PET Sheet Roll">PET Sheet Roll</SelectItem>
                                            <SelectItem value="PVC Film">PVC Film</SelectItem>
                                            <SelectItem value="HIPS Granules">HIPS Granules</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Vendor / Supplier</Label>
                                    <Input placeholder="Enter supplier name" value={newVendor} onChange={(e) => setNewVendor(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Quantity (kg)</Label>
                                    <Input type="number" placeholder="0.00" value={newQty} onChange={(e) => setNewQty(Number(e.target.value))} />
                                </div>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleRaisePO} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirm PO & Notify Supplier"}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-8 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg">Open Purchase Orders</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-emerald-50">
                                            <TableRow>
                                                <TableHead>PO ID</TableHead>
                                                <TableHead>Material</TableHead>
                                                <TableHead>Supplier</TableHead>
                                                <TableHead>Qty</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isFetching ? (
                                                <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin inline" /></TableCell></TableRow>
                                            ) : (
                                                procurements.map(p => (
                                                    <TableRow key={p.id}>
                                                        <TableCell className="font-bold text-emerald-700">{p.purchaseOrderNumber || `PO-${p.id}`}</TableCell>
                                                        <TableCell className="font-medium">{p.itemName}</TableCell>
                                                        <TableCell className="text-sm">{p.vendorName}</TableCell>
                                                        <TableCell className="font-bold">{p.quantity} {p.unit}</TableCell>
                                                        <TableCell><Badge variant="secondary">{p.qcStatus}</Badge></TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="qc">
                    <Card className="shadow-lg border-emerald-100">
                        <CardHeader className="bg-emerald-900 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5" /> Quality Inspection Queue (Incoming)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-emerald-50">
                                        <TableRow>
                                            <TableHead>Batch ID</TableHead>
                                            <TableHead>Item Details</TableHead>
                                            <TableHead>Supplier</TableHead>
                                            <TableHead>QC Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {procurements.filter(p => p.qcStatus === 'Pending').map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-bold">B-{p.id.toString().padStart(4, '0')}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{p.itemName}</div>
                                                    <div className="text-xs text-muted-foreground">{p.quantity} {p.unit}</div>
                                                </TableCell>
                                                <TableCell>{p.vendorName}</TableCell>
                                                <TableCell><Badge variant="secondary">{p.qcStatus}</Badge></TableCell>
                                                <TableCell>
                                                    <Button size="sm" className="bg-emerald-800" onClick={() => { setSelectedBatch(p); setQcOpen(true); }}>
                                                        <ClipboardCheck className="mr-2 h-4 w-4" /> Inspect
                                                    </Button>
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

            <Dialog open={qcOpen} onOpenChange={setQcOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>QC Analysis: Batch B-{selectedBatch?.id.toString().padStart(4, '0')}</DialogTitle>
                        <DialogDescription>{selectedBatch?.itemName} from {selectedBatch?.vendorName}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Thickness (Measured)</Label><Input placeholder="0.52mm" /></div>
                            <div className="space-y-2"><Label>Moisture Content %</Label><Input placeholder="0.05%" /></div>
                        </div>
                        <div className="space-y-2"><Label>Technical Remarks</Label><Textarea placeholder="Lab observations..." /></div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="destructive" onClick={() => handleQCSubmit('Rejected')}>Reject Batch</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleQCSubmit('Approved')}>Approve & Store</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
