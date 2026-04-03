"use client";

import { useState, useEffect } from "react";
import {
    Truck,
    FileCheck,
    Receipt,
    Loader2,
    CheckCircle2,
    MapPin,
    PackageCheck
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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

// --- Types ---
interface PackingBatch {
    id: number;
    finalQCRecord?: {
        batchNumber: string;
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
    };
    numberOfBoxes: number;
    totalWeight: number;
}

interface DispatchRecord {
    id: number;
    packingId: number;
    invoiceNumber: string;
    vehicleNumber: string;
    driverName: string;
    destinationAddress: string;
    dispatchStatus: string;
}

export default function DispatchPage() {
    const [packingList, setPackingList] = useState<PackingBatch[]>([]);
    const [dispatchHistory, setDispatchHistory] = useState<DispatchRecord[]>([]);
    const [selectedPack, setSelectedPack] = useState<PackingBatch | null>(null);
    
    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form States
    const [vehicleNo, setVehicleNo] = useState("");
    const [driverName, setDriverName] = useState("");
    const [destination, setDestination] = useState("");
    const [dispatchOpen, setDispatchOpen] = useState(false);

    // 1. Fetch Data
    const fetchData = async () => {
        try {
            const packRes = await fetch("http://localhost:5278/api/Packing");
            const allPacked: PackingBatch[] = await packRes.json();
            setPackingList(allPacked);

            const dispatchRes = await fetch("http://localhost:5278/api/Dispatch");
            const history: DispatchRecord[] = await dispatchRes.json();
            setDispatchHistory(history.sort((a,b) => b.id - a.id));
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Submit Dispatch
    const handleConfirmDispatch = async () => {
        if (!selectedPack || !vehicleNo || !destination) return;
        setIsLoading(true);

        try {
            const payload = {
                packingId: selectedPack.id,
                vehicleNumber: vehicleNo,
                driverName: driverName,
                invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                destinationAddress: destination,
                dispatchDate: new Date(),
                dispatchStatus: "In-Transit",
                totalDispatchWeight: selectedPack.totalWeight,
                carrierName: "Local Transporter",
                remarks: "Dispatched from warehouse"
            };

            const response = await fetch("http://localhost:5278/api/Dispatch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchData();
                setDispatchOpen(false);
                setSelectedPack(null);
            } else {
                alert("Dispatch submission failed");
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
                    <h1 className="text-3xl font-bold tracking-tight text-indigo-900 border-l-4 border-l-indigo-500 pl-4">Dispatch & Logistics</h1>
                    <p className="text-muted-foreground ml-4">Finalizing shipments, vehicle loading, and tax invoicing.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Packing Ready List */}
                <Card className="md:col-span-8 shadow-xl border-indigo-100">
                    <CardHeader className="bg-indigo-50 border-b">
                        <CardTitle className="text-indigo-900 flex items-center gap-2"><PackageCheck className="h-5 w-5" /> Ready for Loading</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <th className="p-4 text-left font-bold text-indigo-900">Packing ID</th>
                                        <th className="p-4 text-left font-bold text-indigo-900">Customer / Item</th>
                                        <th className="p-4 text-left font-bold text-indigo-900">Boxes</th>
                                        <th className="p-4 text-left font-bold text-indigo-900">Action</th>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isFetching ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin inline" /></TableCell></TableRow>
                                    ) : packingList.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">No items ready in warehouse.</TableCell></TableRow>
                                    ) : (
                                        packingList.map(item => (
                                            <TableRow key={item.id} className="hover:bg-indigo-50/40 transition-all">
                                                <TableCell className="font-black text-indigo-700">PCK-{item.id.toString().padStart(4, '0')}</TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-slate-800">{item.finalQCRecord?.shopFloorRecord?.productionPlan?.order?.inquiry?.customerName || "Export Batch"}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">{item.finalQCRecord?.shopFloorRecord?.productionPlan?.order?.inquiry?.description}</div>
                                                </TableCell>
                                                <TableCell className="font-bold">{item.numberOfBoxes} Cartons</TableCell>
                                                <TableCell>
                                                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 font-bold" onClick={() => { setSelectedPack(item); setDispatchOpen(true); }}>
                                                        <Truck className="mr-2 h-4 w-4" /> Load & Ship
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

                {/* Logistics Stats */}
                <Card className="md:col-span-4 h-fit shadow-md border-t-4 border-t-indigo-600">
                    <CardHeader><CardTitle className="text-sm">Logistics Monitor</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-indigo-50 rounded-2xl flex justify-between items-center border border-indigo-100">
                            <div><p className="text-[10px] font-black text-indigo-500 uppercase">Ships Today</p><p className="text-2xl font-black text-indigo-900">{dispatchHistory.length}</p></div>
                            <Truck className="h-8 w-8 text-indigo-300 opacity-50" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-500 uppercase ml-1">Recent Invoices</p>
                            {dispatchHistory.slice(0, 3).map(d => (
                                <div key={d.id} className="p-3 border rounded-xl bg-slate-50 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700">{d.invoiceNumber}</span>
                                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-[9px]">{d.dispatchStatus}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dispatch Dialog */}
            <Dialog open={dispatchOpen} onOpenChange={setDispatchOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Logistics Configuration</DialogTitle>
                        <DialogDescription className="font-bold text-indigo-600">Shipping PCK-{selectedPack?.id.toString().padStart(4, '0')} • {selectedPack?.numberOfBoxes} Boxes</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label className="text-indigo-900 font-bold">Destination Address</Label>
                            <div className="relative">
                                <Input className="pl-10 h-12 border-indigo-200" placeholder="Street, City, Country" value={destination} onChange={(e) => setDestination(e.target.value)} />
                                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-indigo-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Vehicle Number</Label>
                                <Input className="h-12 font-bold uppercase" placeholder="HR-55-XXXX" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Driver Name</Label>
                                <Input className="h-12" placeholder="Enter name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900 text-white rounded-3xl space-y-4 shadow-xl">
                            <div className="flex justify-between items-center opacity-70">
                                <span className="text-[10px] font-bold tracking-widest uppercase">Invoice Generation Preview</span>
                                <Receipt className="h-4 w-4" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-2xl font-black text-indigo-400">INV-{new Date().getFullYear()}-XXXX</p>
                                <p className="text-[10px] text-slate-400">Digital Tax Invoice will be generated on confirm.</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button className="w-full bg-indigo-700 py-6 text-lg font-black shadow-lg shadow-indigo-200" onClick={handleConfirmDispatch} disabled={isLoading || !vehicleNo || !destination}>
                             {isLoading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 className="h-5 w-5 mr-2" /> Dispatch Shipment & Close Order</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
