"use client";

import { useState } from "react";
import {
    Activity,
    PauseCircle,
    PlayCircle,
    AlertTriangle,
    Scale,
    Settings,
    ClipboardList,
    Factory,
    CalendarDays,
    PackageCheck,
    CalendarClock
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// Mock Data for Planning Step
const pendingSOs = [
    { soNumber: "SO-2024-101", customer: "Acme Corp", product: "Food Tray 500ml", qty: 50000, deadline: "2024-02-15" },
    { soNumber: "SO-2024-102", customer: "Fresh Foods Ltd", product: "Burger Box", qty: 25000, deadline: "2024-02-18" },
];

export default function ProductionPage() {
    // Planning State
    const [orders, setOrders] = useState(pendingSOs);
    const [selectedOrder, setSelectedOrder] = useState<typeof pendingSOs[0] | null>(null);
    const [planOpen, setPlanOpen] = useState(false);

    // Execution State (Existing)
    const [status, setStatus] = useState("Running");
    const [produced] = useState(12500); // Mock starting value
    const [activeJob, setActiveJob] = useState({
        id: "JOB-5001",
        machine: "TF-01",
        product: "Food Tray 500ml",
        targetQty: 50000,
        producedQty: 12500,
        startTime: "08:00 AM",
        status: "Running"
    });
    const [qcOpen, setQcOpen] = useState(false);

    const toggleStatus = () => {
        setStatus(prev => prev === "Running" ? "Paused" : "Running");
    };

    const handleQCLog = (e: React.FormEvent) => {
        e.preventDefault();
        setQcOpen(false);
    };

    const handleCreatePlan = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Work Order Generated for ${selectedOrder?.soNumber}\n\nOutputs:\n- Approved Work Order (WO-${Math.floor(Math.random() * 1000)})\n- Material Requisition Sent to Stores`);
        if (selectedOrder) {
            setOrders(orders.filter(o => o.soNumber !== selectedOrder.soNumber));
            setPlanOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Production Planning & Scheduling</h1>
                    <p className="text-muted-foreground">
                        Plan Work Orders, Allocate Resources, and Monitor Shop Floor.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="planning" className="space-y-4">
                <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-muted/50 p-2">
                    <TabsTrigger value="planning" className="flex-1 sm:flex-none">
                        <CalendarClock className="h-4 w-4 mr-2" /> Planning & Allocation
                    </TabsTrigger>
                    <TabsTrigger value="execution" className="flex-1 sm:flex-none">
                        <Settings className="h-4 w-4 mr-2" /> Shop Floor Execution
                    </TabsTrigger>
                </TabsList>

                {/* --- TAB 1: PLANNING (Step 5 Requirements) --- */}
                <TabsContent value="planning" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Production Orders</CardTitle>
                            <CardDescription>Convert Sales Orders into Production Plans</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {orders.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">All orders planned.</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>SO Number</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Deadline</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order.soNumber}>
                                                <TableCell className="font-medium">{order.soNumber}</TableCell>
                                                <TableCell>{order.customer}</TableCell>
                                                <TableCell>{order.product}</TableCell>
                                                <TableCell>{order.qty.toLocaleString()}</TableCell>
                                                <TableCell>{order.deadline}</TableCell>
                                                <TableCell>
                                                    <Button size="sm" onClick={() => { setSelectedOrder(order); setPlanOpen(true); }}>
                                                        <ClipboardList className="mr-2 h-4 w-4" /> Plan Job
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Planning Dialog */}
                    <Dialog open={planOpen} onOpenChange={setPlanOpen}>
                        <DialogContent className="sm:max-w-[700px] w-full max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create Production Plan / Work Order</DialogTitle>
                                <DialogDescription>Allocating resources for {selectedOrder?.soNumber}</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleCreatePlan} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* 1. Allocation */}
                                    <div className="space-y-4 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><Factory className="h-4 w-4" /> Resource Allocation</h4>
                                        <div className="space-y-2">
                                            <Label>Machine Allocation</Label>
                                            <Select>
                                                <SelectTrigger><SelectValue placeholder="Select Machine" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="TF01">Thermoformer 01 (High Speed)</SelectItem>
                                                    <SelectItem value="TF02">Thermoformer 02</SelectItem>
                                                    <SelectItem value="TF03">Thermoformer 03</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mold Allocation</Label>
                                            <Select>
                                                <SelectTrigger><SelectValue placeholder="Select Mold" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="M-TRAY-500">Mold: 500ml Tray (8 Cavity)</SelectItem>
                                                    <SelectItem value="M-BOX-BURGER">Mold: Burger Box (6 Cavity)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* 2. Schedule & MRP */}
                                    <div className="space-y-4 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Schedule & MRP</h4>
                                        <div className="space-y-2">
                                            <Label>Shift Planning</Label>
                                            <Select>
                                                <SelectTrigger><SelectValue placeholder="Select Shift" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="morning">Morning (06:00 - 14:00)</SelectItem>
                                                    <SelectItem value="evening">Evening (14:00 - 22:00)</SelectItem>
                                                    <SelectItem value="night">Night (22:00 - 06:00)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Planned Start Date</Label>
                                            <Input type="date" />
                                        </div>

                                        <div className="bg-muted p-2 rounded text-sm space-y-1">
                                            <div className="font-semibold flex items-center gap-2"><PackageCheck className="h-3 w-3" /> Material Requirement (MRP)</div>
                                            <div className="flex justify-between">
                                                <span>Raw Material:</span>
                                                <span className="font-mono">PET Sheet</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Est. Quantity:</span>
                                                <span className="font-mono">{(selectedOrder ? selectedOrder.qty * 0.015 : 0).toFixed(1)} kg</span>
                                            </div>
                                            <Badge variant="outline" className="w-full justify-center mt-2 bg-yellow-50 text-yellow-700">Requisition will be auto-generated</Badge>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="submit" className="w-full">
                                        <ClipboardList className="mr-2 h-4 w-4" /> Generate Work Order & Requisition
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* --- TAB 2: EXECUTION (Shop Floor) --- */}
                <TabsContent value="execution" className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-muted/30 p-2 rounded-lg border gap-4">
                        <div className="flex gap-2 items-center">
                            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                            <span className="text-sm font-medium">Live Floor Status: Running</span>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <Button size="sm" variant="outline" className="flex-1 md:flex-none" onClick={() => alert("Production Report Generated")}>
                                <ClipboardList className="mr-2 h-4 w-4" /> Production Report
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 md:flex-none" onClick={() => alert("Scrap Report Generated")}>
                                <ClipboardList className="mr-2 h-4 w-4" /> Scrap Report
                            </Button>
                            <Button size="sm" variant={status === 'Running' ? "destructive" : "default"} className="flex-1 md:flex-none" onClick={toggleStatus}>
                                {status === 'Running' ? <PauseCircle className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                                {status === 'Running' ? "Pause Machine" : "Resume"}
                            </Button>
                        </div>
                    </div>

                    {/* 7.0 Workflow Status */}
                    {/* 7.0 Workflow Status - Horizontal Scroll on Mobile */}
                    <div className="flex overflow-x-auto pb-2 px-2 gap-4 border-b whitespace-nowrap md:justify-between items-center text-xs font-semibold text-muted-foreground w-full">
                        <span className="text-green-600 flex items-center min-w-fit">1. RM Feeding <Activity className="ml-1 h-3 w-3" /></span>
                        <span className="text-green-600 flex items-center min-w-fit">2. Forming (Vac/Heat) <Activity className="ml-1 h-3 w-3" /></span>
                        <span className="text-green-600 flex items-center min-w-fit">3. In-Process QC <Activity className="ml-1 h-3 w-3" /></span>
                        <span className="text-green-600 flex items-center min-w-fit">4. Trimming/Scrap <Activity className="ml-1 h-3 w-3" /></span>
                        <span className="text-green-600 flex items-center min-w-fit">5. Stacking/Output <Activity className="ml-1 h-3 w-3" /></span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* 7.1 Raw Material Feeding */}
                        <Card className="md:col-span-2">
                            <CardHeader className="py-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <PackageCheck className="h-4 w-4" /> 7.1 Raw Material Feeding
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 flex justify-between items-center text-sm">
                                <div>
                                    <span className="text-muted-foreground">Loaded Material:</span>
                                    <span className="ml-2 font-medium">PET Sheet Roll (Food Grade)</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Batch No:</span>
                                    <span className="ml-2 font-medium">RM-2024-8821</span>
                                </div>
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                    QC Verified
                                </Badge>
                            </CardContent>
                        </Card>

                        {/* Active Job Status (Output & Stacking) */}
                        <Card className="md:col-span-2 bg-slate-50 dark:bg-slate-900 border-l-4 border-l-blue-500">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="w-full md:w-auto mb-2 md:mb-0">
                                        <CardTitle className="text-xl flex items-center gap-2 flex-wrap">
                                            {activeJob.machine}: {activeJob.product}
                                            <Badge variant={status === 'Running' ? 'default' : 'secondary'} className={status === 'Running' ? "bg-green-600 animate-pulse" : ""}>
                                                {status}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>Job ID: {activeJob.id} • Started: {activeJob.startTime}</CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{Math.round((produced / activeJob.targetQty) * 100)}%</div>
                                        <div className="text-xs text-muted-foreground">Completed</div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>7.5 Stacking / Produced: {produced.toLocaleString()}</span>
                                        <span>Target: {activeJob.targetQty.toLocaleString()}</span>
                                    </div>
                                    <Progress value={(produced / activeJob.targetQty) * 100} className="h-3" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                    <div className="text-center p-3 bg-background rounded-lg border">
                                        <div className="text-xs text-muted-foreground">Cycle Time</div>
                                        <div className="text-xl font-bold">12.5s</div>
                                    </div>
                                    <div className="text-center p-3 bg-background rounded-lg border">
                                        <div className="text-xs text-muted-foreground">7.4 Scrap Generated</div>
                                        <div className="text-xl font-bold text-orange-600">{(produced * 0.04).toFixed(1)} kg</div>
                                    </div>
                                    <div className="text-center p-3 bg-background rounded-lg border">
                                        <div className="text-xs text-muted-foreground">Scrap Rate</div>
                                        <div className="text-xl font-bold text-orange-600">4.2%</div>
                                    </div>
                                    <div className="text-center p-3 bg-background rounded-lg border">
                                        <div className="text-xs text-muted-foreground">Rejections</div>
                                        <div className="text-xl font-bold text-red-600">85</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 7.2 Forming Parameters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" /> 7.2 Forming Parameters
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Heater Temp (Zone 1)</Label>
                                        <div className="text-lg font-mono p-2 border rounded bg-muted">210°C</div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Heater Temp (Zone 2)</Label>
                                        <div className="text-lg font-mono p-2 border rounded bg-muted">205°C</div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Vacuum Pressure</Label>
                                        <div className="text-lg font-mono p-2 border rounded bg-muted">-0.8 bar</div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Forming Time</Label>
                                        <div className="text-lg font-mono p-2 border rounded bg-muted">3.5s</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 7.3 In-Process QC */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" /> 7.3 In-Process Quality Log
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 border border-dashed rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-sm">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                        <div>
                                            <span className="font-semibold text-yellow-700">QC Alert:</span> Last check was 45 mins ago.
                                        </div>
                                    </div>
                                </div>

                                <Dialog open={qcOpen} onOpenChange={setQcOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full">
                                            <Scale className="mr-2 h-4 w-4" /> Log Dimensional Check
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Hourly QC Check</DialogTitle>
                                            <DialogDescription>7.3 Dimensional, Weight & Visual</DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleQCLog} className="space-y-4 py-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Sample Weight (g)</Label>
                                                    <Input placeholder="Target: 15g" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Wall Thickness (mm)</Label>
                                                    <Input placeholder="Target: 0.45mm" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Visual Defects</Label>
                                                <div className="flex gap-4">
                                                    <Button type="button" variant="outline" className="flex-1">Pass (None)</Button>
                                                    <Button type="button" variant="outline" className="flex-1 text-red-500 hover:text-red-600">Fail</Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Remarks</Label>
                                                <Textarea placeholder="Any deviations observed..." />
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit">Save Log</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <div className="space-y-2 pt-2">
                                    <Label className="text-xs text-muted-foreground">Recent Logs</Label>
                                    <div className="text-sm border-l-2 border-green-500 pl-3 py-1">
                                        <div className="font-medium">10:00 AM - Passed</div>
                                        <div className="text-xs text-muted-foreground">Weight: 15.1g, No defects.</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
