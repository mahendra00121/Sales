"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import {
    CalendarDays,
    Calendar as CalendarIcon,
    Play,
    ClipboardList,
    Loader2,
    Settings
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
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// --- Types ---
interface SalesOrder {
    id: number;
    orderNumber: string;
    customerPONumber: string;
    status: string;
    expectedDeliveryDate: string;
    inquiry?: {
        customerName: string;
        description: string;
        quantityRequested: number;
    };
}

interface ProductionPlan {
    id: number;
    orderId: number;
    machineName: string;
    targetQuantity: number;
    completedQuantity: number;
    plannedStartDate: string;
    plannedEndDate: string;
    status: string;
    priority: string;
    order?: SalesOrder;
}

const machines = ["TF-01 (High Speed)", "TF-02 (Standard)", "TF-03 (Mini)"];
const molds = ["M-TRAY-500", "M-BOX-BURGER", "M-LID-STD", "M-CLAM-PRO"];

export default function PlanningPage() {
    const [orders, setOrders] = useState<SalesOrder[]>([]);
    const [schedule, setSchedule] = useState<ProductionPlan[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Planning Form State
    const [machine, setMachine] = useState("");
    const [selectedMold, setSelectedMold] = useState("");
    const [startDate, setStartDate] = useState<Date>();
    const [priority, setPriority] = useState("Medium");

    // 1. Fetch Data
    const fetchData = async () => {
        try {
            const orderRes = await fetch("http://localhost:5278/api/SalesOrder");
            const allOrders: SalesOrder[] = await orderRes.json();
            setOrders(allOrders.filter(o => o.status === "Confirmed"));

            const planRes = await fetch("http://localhost:5278/api/ProductionPlan");
            const allPlans: ProductionPlan[] = await planRes.json();
            setSchedule(allPlans.sort((a,b) => b.id - a.id));
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Submit Plan
    const handleAddToSchedule = async () => {
        if (!selectedOrder || !machine || !startDate) return;
        setIsLoading(true);

        try {
            const payload = {
                orderId: selectedOrder.id,
                machineName: machine,
                targetQuantity: selectedOrder.inquiry?.quantityRequested || 0,
                completedQuantity: 0,
                plannedStartDate: startDate,
                plannedEndDate: addDays(startDate, 5), 
                status: "Scheduled",
                priority: priority
            };

            const response = await fetch("http://localhost:5278/api/ProductionPlan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchData();
                setSelectedOrder(null);
                setMachine("");
                setStartDate(undefined);
            } else {
                alert("Planning failed");
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
                    <h1 className="text-3xl font-bold tracking-tight text-indigo-900">Production Planning</h1>
                    <p className="text-muted-foreground">
                        Schedule jobs, allocate machines, and issue job cards.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Left: Orders to Plan */}
                <div className="md:col-span-4 space-y-4">
                    <Card className="h-full shadow-md border-l-4 border-l-orange-500">
                        <CardHeader>
                            <CardTitle className="text-lg">Confirmed Orders</CardTitle>
                            <CardDescription>Ready for scheduling</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y max-h-[600px] overflow-y-auto">
                                {isFetching ? (
                                    <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div>
                                ) : orders.length === 0 ? (
                                    <div className="p-10 text-center text-muted-foreground text-sm italic">All orders are scheduled.</div>
                                ) : (
                                    orders.map(order => (
                                        <div
                                            key={order.id}
                                            className={`p-4 cursor-pointer hover:bg-orange-50 transition-colors ${selectedOrder?.id === order.id ? 'bg-orange-50 border-r-4 border-r-orange-600' : ''}`}
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-sm text-indigo-900">{order.orderNumber}</span>
                                                <Badge variant="outline" className="text-[10px] bg-white text-orange-700 border-orange-200">
                                                    Due: {format(new Date(order.expectedDeliveryDate), "dd MMM")}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-semibold">{order.inquiry?.customerName}</p>
                                            <p className="text-[11px] text-muted-foreground truncate">{order.inquiry?.description}</p>
                                            <div className="mt-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                                Qty: {order.inquiry?.quantityRequested?.toLocaleString()} Units
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Planning Interface */}
                <div className="md:col-span-8 space-y-6">
                    {selectedOrder ? (
                        <Card className="border-indigo-200 bg-indigo-50/30 shadow-lg animate-in fade-in duration-300">
                            <CardHeader className="border-b bg-white/50 rounded-t-lg">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-indigo-600" /> Plan Execution: {selectedOrder.orderNumber}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-indigo-900">Resource Allocation (Machine)</Label>
                                        <Select onValueChange={setMachine}>
                                            <SelectTrigger className="bg-white"><SelectValue placeholder="Choose Machine" /></SelectTrigger>
                                            <SelectContent>
                                                {machines.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-indigo-900">Mold / Tooling</Label>
                                        <Select onValueChange={setSelectedMold}>
                                            <SelectTrigger className="bg-white"><SelectValue placeholder="Choose Mold" /></SelectTrigger>
                                            <SelectContent>
                                                {molds.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-indigo-900">Planned Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className={cn("w-full text-left font-normal bg-white", !startDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "PPP") : <span>Select Start Date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-indigo-900">Job Priority</Label>
                                        <Select onValueChange={setPriority} defaultValue="Medium">
                                            <SelectTrigger className="bg-white"><SelectValue placeholder="Select Priority" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="High">High (Express)</SelectItem>
                                                <SelectItem value="Medium">Medium (Standard)</SelectItem>
                                                <SelectItem value="Low">Low (Buffer)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t">
                                    <Button variant="ghost" className="text-indigo-600" onClick={() => setSelectedOrder(null)}>Discard</Button>
                                    <Button onClick={handleAddToSchedule} disabled={isLoading || !machine || !startDate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                                        {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <><CalendarDays className="mr-2 h-4 w-4" /> Issue Job Card</>}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-40 border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-indigo-50/20">
                            <Play className="h-10 w-10 mb-2 text-indigo-300 animate-pulse" />
                            <p className="font-medium text-indigo-400">Select an execution order to start planning.</p>
                        </div>
                    )}

                    {/* Schedule Table */}
                    <Card className="shadow-md">
                        <CardHeader className="bg-indigo-900 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" /> Master Production Schedule (MPS)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-auto max-h-[400px]">
                                <Table>
                                    <TableHeader className="bg-indigo-50">
                                        <TableRow>
                                            <TableHead className="text-indigo-900">Job ID</TableHead>
                                            <TableHead className="text-indigo-900">Machine</TableHead>
                                            <TableHead className="text-indigo-900">Product Details</TableHead>
                                            <TableHead className="text-indigo-900">Schedule</TableHead>
                                            <TableHead className="text-indigo-900">Priority</TableHead>
                                            <TableHead className="text-indigo-900">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isFetching ? (
                                            <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="animate-spin inline text-indigo-600" /></TableCell></TableRow>
                                        ) : schedule.length === 0 ? (
                                            <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">No active production jobs.</TableCell></TableRow>
                                        ) : (
                                            schedule.map(job => (
                                                <TableRow key={job.id} className="hover:bg-indigo-50/30 transition-colors">
                                                    <TableCell className="font-bold text-indigo-700">JOB-{job.id.toString().padStart(5, '0')}</TableCell>
                                                    <TableCell className="font-medium text-slate-700">{job.machineName}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">{job.order?.inquiry?.customerName}</span>
                                                            <span className="text-xs text-muted-foreground">Target: {job.targetQuantity.toLocaleString()} Units</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-[11px] font-medium text-slate-600">Start: {format(new Date(job.plannedStartDate), "dd MMM")}</div>
                                                        <div className="text-[11px] text-muted-foreground">End: {format(new Date(job.plannedEndDate), "dd MMM")}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={cn(
                                                            job.priority === "High" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                                        )}>
                                                            {job.priority}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 uppercase text-[10px]">
                                                            {job.status}
                                                        </Badge>
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
            </div>
        </div>
    );
}
