"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { fetchWithAuth } from "@/lib/api";
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

interface MasterData {
    id: number;
    name: string;
    isActive: boolean;
}

export default function PlanningPage() {
    const [orders, setOrders] = useState<SalesOrder[]>([]);
    const [schedule, setSchedule] = useState<ProductionPlan[]>([]);
    const [machineList, setMachineList] = useState<MasterData[]>([]);
    const [moldList, setMoldList] = useState<MasterData[]>([]);
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
            const [orderRes, planRes, machineRes, moldRes] = await Promise.all([
                fetchWithAuth("/SalesOrder"),
                fetchWithAuth("/ProductionPlan"),
                fetchWithAuth("/MasterData?category=MachineAllocation"),
                fetchWithAuth("/MasterData?category=MoldTooling")
            ]);

            const allOrders: SalesOrder[] = await orderRes.json();
            setOrders(allOrders.filter(o => o.status === "Confirmed"));

            const allPlans: ProductionPlan[] = await planRes.json();
            setSchedule(allPlans.sort((a,b) => b.id - a.id));

            if (machineRes.ok) setMachineList((await machineRes.json()).filter((i: MasterData) => i.isActive));
            if (moldRes.ok) setMoldList((await moldRes.json()).filter((i: MasterData) => i.isActive));
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

            const response = await fetchWithAuth("/ProductionPlan", {
                method: "POST",
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
                    <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">Production Planning</h1>
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
                                    <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
                                ) : orders.length === 0 ? (
                                    <div className="p-10 text-center text-muted-foreground text-sm italic">All orders are scheduled.</div>
                                ) : (
                                    orders.map(order => (
                                        <div
                                            key={order.id}
                                            className={`p-4 cursor-pointer hover:bg-blue-50 dark:bg-blue-900/20 transition-colors ${selectedOrder?.id === order.id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-r-orange-600' : ''}`}
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-sm text-blue-900 dark:text-blue-100">{order.orderNumber}</span>
                                                <Badge variant="outline" className="text-[10px] bg-background text-blue-700 border-blue-200">
                                                    Due: {format(new Date(order.expectedDeliveryDate), "dd MMM")}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-semibold">{order.inquiry?.customerName}</p>
                                            <p className="text-[11px] text-muted-foreground truncate">{order.inquiry?.description}</p>
                                            <div className="mt-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
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
                <div className="md:col-span-8 space-y-6 w-full max-w-full overflow-hidden">
                    {selectedOrder ? (
                        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/30 shadow-lg animate-in fade-in duration-300">
                            <CardHeader className="border-b bg-background/50 rounded-t-lg">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-blue-600" /> Plan Execution: {selectedOrder.orderNumber}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-blue-900 dark:text-blue-100">Resource Allocation (Machine)</Label>
                                        <Select onValueChange={setMachine}>
                                            <SelectTrigger className="bg-background"><SelectValue placeholder="Choose Machine" /></SelectTrigger>
                                            <SelectContent>
                                                {machineList.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                                                {machineList.length === 0 && <SelectItem value="none" disabled>No machines configured</SelectItem>}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-blue-900 dark:text-blue-100">Mold / Tooling</Label>
                                        <Select onValueChange={setSelectedMold}>
                                            <SelectTrigger className="bg-background"><SelectValue placeholder="Choose Mold" /></SelectTrigger>
                                            <SelectContent>
                                                {moldList.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                                                {moldList.length === 0 && <SelectItem value="none" disabled>No molds configured</SelectItem>}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-blue-900 dark:text-blue-100">Planned Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className={cn("w-full text-left font-normal bg-background", !startDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "PPP") : <span>Select Start Date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-blue-900 dark:text-blue-100">Job Priority</Label>
                                        <Select onValueChange={setPriority} defaultValue="Medium">
                                            <SelectTrigger className="bg-background"><SelectValue placeholder="Select Priority" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="High">High (Express)</SelectItem>
                                                <SelectItem value="Medium">Medium (Standard)</SelectItem>
                                                <SelectItem value="Low">Low (Buffer)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t">
                                    <Button variant="ghost" className="text-blue-600" onClick={() => setSelectedOrder(null)}>Discard</Button>
                                    <Button onClick={handleAddToSchedule} disabled={isLoading || !machine || !startDate} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                                        {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <><CalendarDays className="mr-2 h-4 w-4" /> Issue Job Card</>}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-40 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-blue-50/20 dark:bg-blue-900/20">
                            <Play className="h-10 w-10 mb-2 text-blue-300 dark:text-blue-600 animate-pulse" />
                            <p className="font-medium text-blue-400 dark:text-blue-500">Select an execution order to start planning.</p>
                        </div>
                    )}

                    {/* Schedule Table */}
                    <Card className="shadow-md">
                        <CardHeader className="bg-blue-900 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" /> Master Production Schedule (MPS)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-auto w-full max-h-[400px]">
                                <Table className="whitespace-nowrap">
                                    <TableHeader className="bg-blue-50 dark:bg-blue-900/20">
                                        <TableRow>
                                            <TableHead className="text-blue-900 dark:text-blue-100">Job ID</TableHead>
                                            <TableHead className="text-blue-900 dark:text-blue-100">Machine</TableHead>
                                            <TableHead className="text-blue-900 dark:text-blue-100">Product Details</TableHead>
                                            <TableHead className="text-blue-900 dark:text-blue-100">Schedule</TableHead>
                                            <TableHead className="text-blue-900 dark:text-blue-100">Priority</TableHead>
                                            <TableHead className="text-blue-900 dark:text-blue-100">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isFetching ? (
                                            <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="animate-spin inline text-blue-600" /></TableCell></TableRow>
                                        ) : schedule.length === 0 ? (
                                            <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">No active production jobs.</TableCell></TableRow>
                                        ) : (
                                            schedule.map(job => (
                                                <TableRow key={job.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/30 transition-colors">
                                                    <TableCell className="font-bold text-blue-700 dark:text-blue-300">JOB-{job.id.toString().padStart(5, '0')}</TableCell>
                                                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">{job.machineName}</TableCell>
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
                                                            job.priority === "High" ? "bg-blue-100 text-blue-700" : "bg-blue-100 text-blue-700 dark:text-blue-300"
                                                        )}>
                                                            {job.priority}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 uppercase text-[10px]">
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
