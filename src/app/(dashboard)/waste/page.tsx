"use client";

import { useState, useEffect } from "react";
import {
    Recycle,
    Trash2,
    TrendingDown,
    RefreshCcw,
    Loader2,
    Activity,
    CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// --- Types ---
interface WasteRecord {
    id: number;
    wasteType: string;
    weight: number;
    material: string;
    actionTaken: string;
    recordedAt: string;
    remarks: string;
    shopFloorEntry?: {
        batchNumber: string;
    }
}

export default function WastePage() {
    const [wasteLogs, setWasteLogs] = useState<WasteRecord[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [open, setOpen] = useState(false);

    // Form States
    const [weight, setWeight] = useState("");
    const [material, setMaterial] = useState("PET");
    const [wasteType, setWasteType] = useState("Trim Scrap");
    const [remarks, setRemarks] = useState("");

    const fetchData = async () => {
        try {
            const res = await fetchWithAuth("/WasteRecord");
            const data: WasteRecord[] = await res.json();
            setWasteLogs(data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddLog = async () => {
        if (!weight) return;
        setIsLoading(true);

        try {
            const payload = {
                shopFloorId: 1, // Manual dummy or link to active
                wasteType: wasteType,
                weight: parseFloat(weight),
                material: material,
                actionTaken: "Pending",
                recordedAt: new Date(),
                remarks: remarks
            };

            const response = await fetchWithAuth("/WasteRecord", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchData();
                setOpen(false);
                setWeight("");
                setRemarks("");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, action: string) => {
        setUpdatingId(id);
        try {
            const response = await fetchWithAuth(`/WasteRecord/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(action),
            });

            if (response.ok) {
                toast.success(`Scrap successfully ${action === 'Recycled' ? 'sent for grinding' : 'disposed'}`);
                await fetchData();
            } else {
                toast.error("Failed to update scrap status.");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Error connecting to server.");
        } finally {
            setUpdatingId(null);
        }
    };

    const totalWaste = wasteLogs.reduce((acc, curr) => acc + curr.weight, 0);
    const recycledWaste = wasteLogs.filter(l => l.actionTaken === 'Recycled').reduce((acc, curr) => acc + curr.weight, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 border-l-8 border-l-emerald-500 pl-6">Waste & Material Recovery</h1>
                    <p className="text-muted-foreground font-medium ml-6">Track production scrap cycles and regrind sustainability.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 font-bold py-6 px-10 rounded-2xl shadow-xl shadow-blue-100">
                            <Recycle className="mr-2 h-5 w-5" /> Log New Scrap
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Log Manufacturing Waste</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Weight (kg)</Label>
                                <Input type="number" className="h-12 font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Material</Label>
                                    <Select onValueChange={setMaterial} defaultValue="PET">
                                        <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PET">PET</SelectItem>
                                            <SelectItem value="PVC">PVC</SelectItem>
                                            <SelectItem value="HIPS">HIPS</SelectItem>
                                            <SelectItem value="PP">PP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Waste Type</Label>
                                    <Select onValueChange={setWasteType} defaultValue="Trim Scrap">
                                        <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Trim Scrap">Trim Waste</SelectItem>
                                            <SelectItem value="Rejection">QC Rejection</SelectItem>
                                            <SelectItem value="Purge">Start-up Purge</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Operator Notes</Label>
                                <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Grinder machine ID or bin no..." />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button className="w-full bg-blue-700 py-6 font-bold text-lg" onClick={handleAddLog} disabled={isLoading}>
                                 {isLoading ? <Loader2 className="animate-spin" /> : "Save Disposition Entry"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-xl rounded-3xl bg-background overflow-hidden">
                    <div className="h-2 bg-slate-400" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black text-slate-400 uppercase">Total Generated</CardTitle>
                        <Trash2 className="h-5 w-5 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{totalWaste.toFixed(2)} <span className="text-sm font-medium text-slate-400">kg</span></div>
                        <p className="text-[10px] font-bold text-slate-500 mt-2 flex items-center gap-1"><Activity className="h-3 w-3" /> Cumulative Month-to-Date</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl rounded-3xl bg-blue-50 dark:bg-blue-900/20 overflow-hidden">
                    <div className="h-2 bg-blue-600" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black text-blue-600 uppercase">Recycled / Grinded</CardTitle>
                        <RefreshCcw className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-blue-900 dark:text-blue-100">{recycledWaste.toFixed(2)} <span className="text-sm font-medium text-blue-400">kg</span></div>
                        <p className="text-[10px] font-bold text-blue-600 mt-2">Recovery Rate: {totalWaste > 0 ? ((recycledWaste/totalWaste)*100).toFixed(1) : 0}%</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl rounded-3xl bg-blue-50 dark:bg-blue-900/20 overflow-hidden">
                    <div className="h-2 bg-blue-600" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black text-blue-600 uppercase">Eco Disposal</CardTitle>
                        <TrendingDown className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-blue-900 dark:text-blue-100">{(totalWaste - recycledWaste).toFixed(2)} <span className="text-sm font-medium text-blue-400">kg</span></div>
                        <p className="text-[10px] font-bold text-blue-600 mt-2">Non-recyclables Sent to Disposal</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b">
                    <CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-blue-600" /> Waste Disposition Log</CardTitle>
                    <CardDescription>Monitor scrap movement from shop floor to recycling station.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                <TableRow>
                                    <TableHead className="font-bold text-slate-600 uppercase text-[10px]">Date</TableHead>
                                    <TableHead className="font-bold text-slate-600 uppercase text-[10px]">Type / Material</TableHead>
                                    <TableHead className="font-bold text-slate-600 uppercase text-[10px]">Weight</TableHead>
                                    <TableHead className="font-bold text-slate-600 uppercase text-[10px]">Status</TableHead>
                                    <TableHead className="font-bold text-slate-600 uppercase text-[10px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isFetching ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin inline" /></TableCell></TableRow>
                                ) : wasteLogs.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-400 italic">No scrap records found.</TableCell></TableRow>
                                ) : (
                                    wasteLogs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <TableCell className="text-xs font-medium">{new Date(log.recordedAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="font-black text-slate-800 dark:text-slate-200">{log.wasteType}</div>
                                                <div className="text-[10px] font-bold text-blue-600">{log.material}</div>
                                            </TableCell>
                                            <TableCell className="font-black text-lg">{log.weight} <span className="text-[10px] text-slate-400">kg</span></TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(
                                                    "font-bold px-3 py-1 rounded-full border-none",
                                                    log.actionTaken === 'Pending' && "bg-amber-100 text-amber-700",
                                                    log.actionTaken === 'Recycled' && "bg-emerald-100 text-emerald-700",
                                                    log.actionTaken === 'Disposed' && "bg-rose-100 text-rose-700"
                                                )}>
                                                    {log.actionTaken}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {log.actionTaken === "Pending" && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-8 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold" 
                                                            onClick={() => handleUpdateStatus(log.id, "Recycled")}
                                                            disabled={updatingId === log.id}
                                                        >
                                                            {updatingId === log.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCcw className="mr-1 h-3 w-3" />} 
                                                            Grind
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            className="h-8 text-rose-600 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20" 
                                                            onClick={() => handleUpdateStatus(log.id, "Disposed")}
                                                            disabled={updatingId === log.id}
                                                        >
                                                            Dispose
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
