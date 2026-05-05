"use client";

import { useState, useEffect } from "react";
import {
    Package,
    Box,
    Printer,
    Barcode,
    Loader2,
    CheckCircle2,
    History,
    Weight
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Updated Types to match Backend ---
interface QCReport {
    id: number;
    batchNumber: string;
    passedQuantity: number;
    outcome: string;
    shopFloorRecord?: {
        productionPlan?: {
            order?: {
                inquiry?: {
                    customerName: string;
                    description: string;
                }
            }
        }
    }
}

interface PackingRecord {
    id: number;
    finalQCId: number;
    numberOfBoxes: number;
    packingType: string;
    totalWeight: number;
    packedBy: string;
    packingDate: string;
}

interface MasterData {
    id: number;
    name: string;
    isActive: boolean;
}

export default function PackingPage() {
    const [qcReports, setQcReports] = useState<QCReport[]>([]);
    const [packingHistory, setPackingHistory] = useState<PackingRecord[]>([]);
    const [packingMaterials, setPackingMaterials] = useState<MasterData[]>([]);
    const [selectedQC, setSelectedQC] = useState<QCReport | null>(null);
    
    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form States
    const [packingType, setPackingType] = useState("");
    const [numBoxes, setNumBoxes] = useState(1);
    const [totalWeight, setTotalWeight] = useState(0);
    const [packingOpen, setPackingOpen] = useState(false);

    const fetchData = async () => {
        try {
            const [qcRes, packRes, materialRes] = await Promise.all([
                fetchWithAuth("/FinalQC"),
                fetchWithAuth("/Packing"),
                fetchWithAuth("/MasterData?category=PackingMaterial")
            ]);

            const allQC: QCReport[] = await qcRes.json();
            setQcReports(allQC.filter(r => r.outcome === 'Pass'));

            const history: PackingRecord[] = await packRes.json();
            setPackingHistory(history.sort((a,b) => b.id - a.id));

            if (materialRes.ok) {
                const materials = (await materialRes.json()).filter((m: MasterData) => m.isActive);
                setPackingMaterials(materials);
                if (materials.length > 0 && !packingType) {
                    setPackingType(materials[0].name);
                }
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleConfirmPacking = async () => {
        if (!selectedQC || numBoxes <= 0) return;
        setIsLoading(true);

        try {
            const payload = {
                finalQCId: selectedQC.id,
                numberOfBoxes: numBoxes,
                packingType: packingType,
                totalWeight: totalWeight || (numBoxes * 1.5), // Dummy weight if not entered
                packedBy: "Packing Operator 01",
                packingDate: new Date(),
                packingNotes: "Standard packing completed"
            };

            const response = await fetchWithAuth("/Packing", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchData();
                setPackingOpen(false);
                setSelectedQC(null);
            } else {
                alert("Packing submission failed");
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
                    <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100 border-l-4 border-l-blue-500 pl-4">Packaging & Barcoding</h1>
                    <p className="text-muted-foreground ml-4">Finalizing certified goods for logistics distribution.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                <Card className="md:col-span-8 shadow-lg border-blue-100 dark:border-blue-800 w-full overflow-hidden">
                    <CardHeader className="bg-blue-50/50 dark:bg-blue-900/50 border-b">
                        <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2"><Package className="h-5 w-5" /> QC Released Items</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm whitespace-nowrap">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600">
                                    <tr>
                                        <th className="p-4 text-left">QC Batch</th>
                                        <th className="p-4 text-left">Customer</th>
                                        <th className="p-4 text-left">Ready Qty</th>
                                        <th className="p-4 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {isFetching ? (
                                        <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin inline" /></td></tr>
                                    ) : (
                                        qcReports.map(qc => (
                                            <tr key={qc.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/40 transition-all">
                                                <td className="p-4 font-bold text-blue-700 dark:text-blue-300">{qc.batchNumber || `QCB-${qc.id}`}</td>
                                                <td className="p-4 font-semibold">{qc.shopFloorRecord?.productionPlan?.order?.inquiry?.customerName || "Stock"}</td>
                                                <td className="p-4 font-black">{qc.passedQuantity?.toLocaleString() ?? "0"} Pcs</td>
                                                <td className="p-4">
                                                    <Button size="sm" className="bg-blue-600 font-bold" onClick={() => { setSelectedQC(qc); setPackingOpen(true); }}>
                                                        <Box className="mr-2 h-4 w-4" /> Log Packing
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-4 h-fit shadow-md border-t-4 border-t-blue-600 w-full overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2"><History className="h-4 w-4" /> Packing Log</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {packingHistory.slice(0, 5).map(p => (
                            <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 border rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-slate-500">ID: PCK-{p.id}</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{p.numberOfBoxes} {p.packingType}s</p>
                                    <p className="text-[10px] text-blue-600">{p.totalWeight} kg Total</p>
                                </div>
                                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={packingOpen} onOpenChange={setPackingOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Packing Details</DialogTitle>
                        <DialogDescription className="font-bold text-blue-600">Certified Quantity: {selectedQC?.passedQuantity?.toLocaleString() ?? "0"} Pcs</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label>Packing Material Type</Label>
                            <Select value={packingType} onValueChange={setPackingType}>
                                <SelectTrigger className="h-12"><SelectValue placeholder="Select Packing Material" /></SelectTrigger>
                                <SelectContent>
                                    {packingMaterials.map(m => (
                                        <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                                    ))}
                                    {packingMaterials.length === 0 && <SelectItem value="none" disabled>No materials configured</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Number of Boxes / Units</Label>
                                <Input type="number" className="h-12 font-bold" value={numBoxes} onChange={(e) => setNumBoxes(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Weight (kg)</Label>
                                <div className="relative">
                                    <Input type="number" className="h-12 font-bold pl-10" value={totalWeight} onChange={(e) => setTotalWeight(Number(e.target.value))} />
                                    <Weight className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-3xl text-center">
                            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">PACKING SUMMARY</p>
                            <p className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase">{numBoxes} {packingType}(S) PACKED BY ADM-01</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button className="w-full bg-blue-700 py-6 text-lg font-bold shadow-lg" onClick={handleConfirmPacking} disabled={isLoading}>
                             {isLoading ? <Loader2 className="animate-spin" /> : "Confirm & Seal Batch"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
