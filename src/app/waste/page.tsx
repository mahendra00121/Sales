"use client";

import { useState } from "react";
import {
    Recycle,
    Trash2,
    TrendingDown,
    RefreshCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// Mock Waste Logs
interface WasteLog {
    id: string;
    date: string;
    source: string;
    jobId: string;
    material: string;
    weight: number;
    type: string;
    status: string;
}

const wasteLogs: WasteLog[] = [
    {
        id: "WS-2024-001",
        date: "2024-02-14",
        source: "Production - TF-01",
        jobId: "JOB-1001",
        material: "PET",
        weight: 45.5, // kg
        type: "Trim Waste", // Trim, Start-up waste, Rejection
        status: "Pending" // Pending -> Grinded -> Sold
    },
    {
        id: "WS-2024-002",
        date: "2024-02-14",
        source: "Final QC",
        jobId: "JOB-0099",
        material: "HIPS",
        weight: 12.0,
        type: "Rejection",
        status: "Disposed"
    }
];

export default function WastePage() {
    const [logs, setLogs] = useState<WasteLog[]>(wasteLogs);
    const [open, setOpen] = useState(false);

    // New Log Form
    const [weight, setWeight] = useState("");
    const [type, setType] = useState("Trim Waste");
    const [source, setSource] = useState("Production");

    const handleAddLog = () => {
        const newLog = {
            id: `WS-2024-${logs.length + 100}`,
            date: new Date().toISOString().split('T')[0],
            source: source,
            jobId: "MANUAL",
            material: "Mixed",
            weight: Number(weight),
            type: type,
            status: "Pending"
        };
        setLogs([newLog, ...logs]);
        setOpen(false);
        setWeight("");
    };

    const handleProcess = (id: string, action: string) => {
        setLogs(logs.map(log => log.id === id ? { ...log, status: action } : log));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Waste Handling & Recycling</h1>
                    <p className="text-muted-foreground">
                        Track scrap generation, regrinding, and eco-friendly disposal.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Recycle className="mr-2 h-4 w-4" /> Log Waste
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Log New Waste Batch</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Weight (kg)</Label>
                                <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Source</Label>
                                <Select onValueChange={setSource} defaultValue="Production">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Production">Production Line</SelectItem>
                                        <SelectItem value="Final QC">Final QC</SelectItem>
                                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Waste Type</Label>
                                <Select onValueChange={setType} defaultValue="Trim Waste">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Trim Waste">Trim Scrap (Clean)</SelectItem>
                                        <SelectItem value="Rejection">QC Rejection</SelectItem>
                                        <SelectItem value="Purge">Machine Purge / Lump</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddLog}>Save Log</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between lg:pb-2">
                        <CardTitle className="text-sm font-medium">Total Waste (Month)</CardTitle>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">57.5 kg</div>
                        <p className="text-xs text-muted-foreground">+5% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between lg:pb-2">
                        <CardTitle className="text-sm font-medium">Recycled / Grinded</CardTitle>
                        <RefreshCcw className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">45.0 %</div>
                        <p className="text-xs text-muted-foreground">Recovery Rate</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between lg:pb-2">
                        <CardTitle className="text-sm font-medium">Sent for Disposal</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">12.0 kg</div>
                        <p className="text-xs text-muted-foreground">Non-recyclable</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Waste Tracking Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Log ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Weight</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">{log.id}</TableCell>
                                        <TableCell>{log.date}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{log.source}</span>
                                                <span className="text-xs text-muted-foreground">{log.jobId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{log.type}</TableCell>
                                        <TableCell>{log.weight} kg</TableCell>
                                        <TableCell>
                                            <Badge variant={log.status === "Pending" ? "destructive" : "outline"} className={log.status === "Grinded" ? "border-green-600 text-green-600" : ""}>
                                                {log.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {log.status === "Pending" && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleProcess(log.id, "Grinded")}>
                                                        <Recycle className="mr-1 h-3 w-3" /> Grind
                                                    </Button>
                                                    <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => handleProcess(log.id, "Disposed")}>
                                                        Dispose
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Reporting Section */}
            <h2 className="text-2xl font-bold tracking-tight pt-4">KPI & Performance Reporting</h2>
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Production Efficiency</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-2xl font-bold">92.4%</div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-[92.4%]"></div>
                        </div>
                        <p className="text-xs text-muted-foreground">Target: 90% (Above Target)</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Rejection Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Trim Waste</span>
                                <span className="font-bold">60%</span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 w-[60%]"></div>
                            </div>

                            <div className="flex justify-between text-sm pt-2">
                                <span>Quality Defects</span>
                                <span className="font-bold">30%</span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 w-[30%]"></div>
                            </div>

                            <div className="flex justify-between text-sm pt-2">
                                <span>Setup / Start-up</span>
                                <span className="font-bold">10%</span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-gray-500 w-[10%]"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">On-Time Delivery (OTD)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-2">
                        <div className="relative flex items-center justify-center h-24 w-24 rounded-full border-4 border-green-500 bg-green-50">
                            <span className="text-xl font-bold text-green-700">98.5%</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">Average Delay: 0 Days</p>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
