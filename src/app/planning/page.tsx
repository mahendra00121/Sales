"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    CalendarDays,
    Calendar as CalendarIcon,
    Play,
    ClipboardList
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

// Mock Active Sales Orders (Inputs for planning)
interface SalesOrder {
    soNumber: string;
    customer: string;
    product: string;
    quantity: number;
    deliveryDate: string;
    status: string;
}

const pendingSOs: SalesOrder[] = [
    {
        soNumber: "SO-2024-101",
        customer: "Acme Corp",
        product: "Food Tray 500ml",
        quantity: 50000,
        deliveryDate: "2024-02-15",
        status: "Unscheduled"
    },
    {
        soNumber: "SO-2024-102",
        customer: "Fresh Foods Ltd",
        product: "Burger Box",
        quantity: 25000,
        deliveryDate: "2024-02-20",
        status: "Unscheduled"
    }
];

// Mock Resources
const machines = ["TF-01 (High Speed)", "TF-02", "TF-03"];
const molds = ["M-TRAY-500", "M-BOX-BURGER", "M-LID-STD"];

interface ProductionJob {
    jobId: string;
    soNumber: string;
    product: string;
    quantity: number;
    machine: string;
    mold: string;
    startDate: string;
    shift: string;
    status: string;
}

export default function PlanningPage() {
    const [orders, setOrders] = useState<SalesOrder[]>(pendingSOs);
    const [schedule, setSchedule] = useState<ProductionJob[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

    // Planning Form State
    const [machine, setMachine] = useState("");
    const [mold, setMold] = useState("");
    const [startDate, setStartDate] = useState<Date>();
    const [shift, setShift] = useState("Shift A (Morning)");

    const handleAddToSchedule = () => {
        if (!selectedOrder || !machine || !mold || !startDate) return;

        const newJob = {
            jobId: `JOB-${schedule.length + 5001}`,
            soNumber: selectedOrder.soNumber,
            product: selectedOrder.product,
            quantity: selectedOrder.quantity,
            machine,
            mold,
            startDate: format(startDate, 'yyyy-MM-dd'),
            shift,
            status: "Scheduled"
        };

        setSchedule([...schedule, newJob]);
        setOrders(orders.filter(o => o.soNumber !== selectedOrder.soNumber));

        // Reset selection
        setSelectedOrder(null);
        setMachine("");
        setMold("");
        setStartDate(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Production Planning</h1>
                    <p className="text-muted-foreground">
                        Schedule jobs, allocate machines, and issue job cards.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Left Col: Pending Orders */}
                <div className="md:col-span-4 space-y-4">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Orders to Plan</CardTitle>
                            <CardDescription>Select an order to schedule</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {orders.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground text-sm">All orders scheduled!</div>
                                ) : (
                                    orders.map(order => (
                                        <div
                                            key={order.soNumber}
                                            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedOrder?.soNumber === order.soNumber ? 'bg-muted border-l-4 border-l-primary' : ''}`}
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-sm">{order.soNumber}</span>
                                                <Badge variant="secondary" className="text-[10px]">{order.deliveryDate}</Badge>
                                            </div>
                                            <p className="text-sm font-medium">{order.customer}</p>
                                            <p className="text-xs text-muted-foreground">{order.product} • {order.quantity.toLocaleString()} units</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Center/Right Col: Planning Interface or Schedule View */}
                <div className="md:col-span-8 space-y-6">
                    {/* Planning Form */}
                    {selectedOrder ? (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="text-lg">Schedule Job for {selectedOrder.soNumber}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Select Machine</Label>
                                        <Select onValueChange={setMachine}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose Machine" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {machines.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Select Mold</Label>
                                        <Select onValueChange={setMold}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose Mold" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {molds.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Planned Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full text-left font-normal",
                                                        !startDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={startDate}
                                                    onSelect={setStartDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Shift</Label>
                                        <Select onValueChange={setShift} defaultValue="Shift A (Morning)">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Shift" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Shift A (Morning)">Shift A (Morning)</SelectItem>
                                                <SelectItem value="Shift B (Evening)">Shift B (Evening)</SelectItem>
                                                <SelectItem value="Shift C (Night)">Shift C (Night)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-end gap-2">
                                    <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Cancel</Button>
                                    <Button onClick={handleAddToSchedule} disabled={!machine || !mold || !startDate}>
                                        <CalendarDays className="mr-2 h-4 w-4" />
                                        Create Job & Schedule
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                            <Play className="h-8 w-8 mb-2 opacity-20" />
                            <p>Select an order from the left list to start planning.</p>
                        </div>
                    )}

                    {/* Active Schedule Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" /> Active Production Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Job ID</TableHead>
                                            <TableHead>Machine</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Shift</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {schedule.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                    No active jobs scheduled.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            schedule.map(job => (
                                                <TableRow key={job.jobId}>
                                                    <TableCell className="font-medium">{job.jobId}</TableCell>
                                                    <TableCell>{job.machine}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span>{job.product}</span>
                                                            <span className="text-xs text-muted-foreground">Qty: {job.quantity}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{job.startDate}</TableCell>
                                                    <TableCell>{job.shift}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
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
