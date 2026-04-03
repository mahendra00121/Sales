"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    PauseCircle,
    PlayCircle,
    AlertTriangle,
    Scale,
    Settings,
    ClipboardList,
    Factory,
    PackageCheck,
    Loader2,
    CheckCircle
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// --- Types ---
interface ProductionPlan {
    id: number;
    machineName: string;
    targetQuantity: number;
    completedQuantity: number;
    status: string;
    order?: {
        inquiry?: {
            customerName: string;
            description: string;
        }
    }
}

interface ShopFloorEntry {
    id: number;
    productionPlanId: number;
    producedQuantity: number;
    rejectedQuantity: number;
    scrapWeight: number;
    logDate: string;
}

export default function ProductionPage() {
    const [plans, setPlans] = useState<ProductionPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Logging State
    const [produced, setProduced] = useState(0);
    const [rejected, setRejected] = useState(0);
    const [scrap, setScrap] = useState(0);
    const [logOpen, setLogOpen] = useState(false);

    // 1. Fetch Data
    const fetchData = async () => {
        try {
            const res = await fetch("http://localhost:5278/api/ProductionPlan");
            const data: ProductionPlan[] = await res.json();
            setPlans(data.filter(p => p.status !== "Completed"));
            
            // Auto-select first active plan if nothing selected
            if (data.length > 0 && !selectedPlan) {
                const active = data.find(p => p.status === "Scheduled" || p.status === "In-Progress");
                if (active) setSelectedPlan(active);
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

    // 2. Submit Production Log
    const handleLogProduction = async () => {
        if (!selectedPlan || produced <= 0) return;
        setIsLoading(true);

        try {
            const payload = {
                productionPlanId: selectedPlan.id,
                batchNumber: `BATCH-${Date.now().toString().slice(-6)}`,
                actualQuantityProduced: produced,
                wasteQuantity: rejected,
                materialConsumedQuantity: scrap, // Mapping scrap to material consumed for now
                operatorName: "Floor Operator 01",
                shift: "Day",
                startTime: new Date(),
                endTime: new Date(),
                productionNotes: "Standard production log",
                recordedAt: new Date()
            };

            const response = await fetch("http://localhost:5278/api/ShopFloor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchData();
                setLogOpen(false);
                setProduced(0);
                setRejected(0);
                setScrap(0);
            } else {
                alert("Log submission failed");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const completionPercent = selectedPlan ? (selectedPlan.completedQuantity / selectedPlan.targetQuantity) * 100 : 0;

    return (
        <div className="space-y-6 p-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-l-orange-500 pl-4">Shop Floor Execution</h1>
                    <p className="text-muted-foreground ml-4">
                        Real-time machine output monitoring and quality logging.
                    </p>
                </div>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={fetchData}><Activity className="h-4 w-4 mr-2" /> Sync Live</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Active Jobs List */}
                <Card className="md:col-span-4 shadow-md bg-slate-50/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Active Machine Jobs</CardTitle>
                        <CardDescription>Select job to log production</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y overflow-y-auto max-h-[600px]">
                            {isFetching ? (
                                <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>
                            ) : plans.length === 0 ? (
                                <div className="p-10 text-center text-muted-foreground italic">No active production plans.</div>
                            ) : (
                                plans.map(plan => (
                                    <div 
                                        key={plan.id} 
                                        className={`p-4 cursor-pointer hover:bg-slate-100 transition-all ${selectedPlan?.id === plan.id ? 'bg-white shadow border-l-4 border-l-blue-600' : ''}`}
                                        onClick={() => setSelectedPlan(plan)}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <Badge className="bg-slate-800">{plan.machineName}</Badge>
                                            <Badge variant="outline" className="text-[10px]">{plan.status}</Badge>
                                        </div>
                                        <div className="font-bold text-slate-800">{plan.order?.inquiry?.customerName}</div>
                                        <div className="text-xs text-muted-foreground truncate">{plan.order?.inquiry?.description}</div>
                                        <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-500">
                                            <span>Progress</span>
                                            <span>{Math.round((plan.completedQuantity / plan.targetQuantity) * 100)}%</span>
                                        </div>
                                        <Progress value={(plan.completedQuantity / plan.targetQuantity) * 100} className="h-1.5 mt-1" />
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Dashboard & Controls */}
                <div className="md:col-span-8 space-y-6">
                    {selectedPlan ? (
                        <>
                            {/* Live Counter */}
                            <Card className="bg-slate-900 text-white shadow-2xl overflow-hidden relative border-none">
                                <div className="absolute top-0 right-0 p-8 opacity-10"><Factory className="h-40 w-40" /></div>
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-600 rounded-2xl animate-pulse"><Activity className="h-6 w-6" /></div>
                                        <div>
                                            <CardTitle className="text-2xl">{selectedPlan.machineName} - {selectedPlan.order?.inquiry?.customerName}</CardTitle>
                                            <CardDescription className="text-slate-400">Target: {selectedPlan.targetQuantity.toLocaleString()} Units</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Produced</span>
                                            <div className="text-5xl font-black text-blue-400">{selectedPlan.completedQuantity.toLocaleString()}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Balance</span>
                                            <div className="text-5xl font-black text-rose-400">{(selectedPlan.targetQuantity - selectedPlan.completedQuantity).toLocaleString()}</div>
                                        </div>
                                        <div className="space-y-1 hidden md:block">
                                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Status</span>
                                            <div className="text-2xl font-bold flex items-center gap-2 mt-4"><CheckCircle className="h-6 w-6 text-green-500" /> ON-TRACK</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-bold text-slate-300">
                                            <span>REAL-TIME COMPLETION</span>
                                            <span>{completionPercent.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={completionPercent} className="h-4 bg-slate-800" />
                                    </div>
                                    <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800">
                                        <Button className="bg-white text-slate-900 hover:bg-slate-200 font-bold px-8" onClick={() => setLogOpen(true)}>
                                            <Activity className="h-4 w-4 mr-2" /> Log Output
                                        </Button>
                                        <Button variant="outline" className="border-slate-700 hover:bg-slate-800"><AlertTriangle className="h-4 w-4 mr-2" /> Machine Breakdown</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Secondary Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="shadow-sm">
                                    <CardHeader className="py-4">
                                        <CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Forming Parameters</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-3 pb-4">
                                        <div className="p-3 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 block">TEMP Z1</span><span className="font-bold">215°C</span></div>
                                        <div className="p-3 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 block">CYCLE</span><span className="font-bold">12.5s</span></div>
                                        <div className="p-3 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 block">VACUUM</span><span className="font-bold">-0.8bar</span></div>
                                        <div className="p-3 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 block">COOLING</span><span className="font-bold">4.2s</span></div>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-sm">
                                    <CardHeader className="py-4">
                                        <CardTitle className="text-sm flex items-center gap-2"><Scale className="h-4 w-4" /> Technical Quality Checks</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="p-4 border-2 border-dashed rounded-xl bg-orange-50/50 text-center">
                                            <p className="text-xs text-orange-700 font-bold mb-2">LAST CHECK: 45 MINS AGO</p>
                                            <Button size="sm" variant="outline" className="border-orange-200">Log Dimensional Check</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <div className="h-64 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                            <PlayCircle className="h-16 w-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a machine job from the left sidebar to start monitoring.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Log Production Dialog */}
            <Dialog open={logOpen} onOpenChange={setLogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Log Production Output</DialogTitle>
                        <DialogDescription>Enter quantities produced since last log for JOB-{selectedPlan?.id}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-blue-600 font-bold">Good Produced (Pcs)</Label>
                            <Input type="number" className="text-2xl font-black h-14" placeholder="0" value={produced} onChange={(e) => setProduced(Number(e.target.value))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-rose-600 font-medium">Rejected (Pcs)</Label>
                                <Input type="number" placeholder="0" value={rejected} onChange={(e) => setRejected(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium">Scrap Weight (kg)</Label>
                                <Input type="number" placeholder="0.00" value={scrap} onChange={(e) => setScrap(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full bg-slate-900 py-6 text-lg" onClick={handleLogProduction} disabled={isLoading || produced <= 0}>
                            {isLoading ? <Loader2 className="animate-spin" /> : "Save Production Log"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
