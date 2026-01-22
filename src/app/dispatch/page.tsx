"use client";

import { useState } from "react";
import {
    Truck,
    FileCheck,
    Receipt,
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
import { Separator } from "@/components/ui/separator";

// Approved for Dispatch
interface DispatchOrder {
    soNumber: string;
    customer: string;
    destination: string;
    items: string;
    qty: number;
    status: string;
}

const dispatchQueue: DispatchOrder[] = [
    {
        soNumber: "SO-2024-101",
        customer: "Acme Corp",
        destination: "New York, USA",
        items: "Food Tray 500ml",
        qty: 50000,
        status: "Ready to Ship"
    },
    {
        soNumber: "SO-2024-099",
        customer: "Global Pharma",
        destination: "Berlin, DE",
        items: "Vial Blister",
        qty: 120000,
        status: "Shipped"
    }
];

export default function DispatchPage() {
    const [queue, setQueue] = useState<DispatchOrder[]>(dispatchQueue);
    const [selectedOrder, setSelectedOrder] = useState<DispatchOrder | null>(null);
    const [open, setOpen] = useState(false);

    // Form State
    const [invoiceNo, setInvoiceNo] = useState("");
    const [vehicleNo, setVehicleNo] = useState("");

    const handleDispatch = () => {
        if (!selectedOrder) return;

        alert(`Shipment Dispatched for ${selectedOrder.soNumber}!\n\nDocuments Generated:\n- Tax Invoice\n- Packing List\n- Certificate of Analysis (COA)\n- Delivery Challan\n\nSales Order successfully Closed.`);

        setQueue(queue.map(o => o.soNumber === selectedOrder.soNumber ? { ...o, status: "Shipped" } : o));
        setOpen(false);
        setSelectedOrder(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dispatch & Logistics</h1>
                    <p className="text-muted-foreground">
                        Invoicing, transport arrangement, and final order closure.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Dispatch Schedule List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Dispatch Schedule</CardTitle>
                        <CardDescription>Orders ready for loading</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SO Number</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {queue.map(order => (
                                        <TableRow key={order.soNumber}>
                                            <TableCell className="font-medium">{order.soNumber}</TableCell>
                                            <TableCell>{order.customer}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{order.items}</span>
                                                    <span className="text-xs text-muted-foreground">{order.qty.toLocaleString()} units</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs">{order.destination}</TableCell>
                                            <TableCell>
                                                <Badge variant={order.status === 'Shipped' ? 'default' : 'secondary'}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {order.status === 'Ready to Ship' && (
                                                    <Button size="sm" onClick={() => { setSelectedOrder(order); setOpen(true); }}>
                                                        <Truck className="mr-2 h-4 w-4" /> Ship
                                                    </Button>
                                                )}
                                                {order.status === 'Shipped' && (
                                                    <Button size="sm" variant="ghost" disabled>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Closed
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Logistics Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm text-muted-foreground">Pending Shipments</span>
                                <span className="font-bold text-xl">1</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm text-muted-foreground">Processed Today</span>
                                <span className="font-bold text-xl">12</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Pending Invoices</span>
                                <span className="font-bold text-xl text-orange-600">3</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Shipment Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[500px] w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Shipment</DialogTitle>
                        <DialogDescription>
                            Details for {selectedOrder?.soNumber} ({selectedOrder?.customer})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Tax Invoice Number</Label>
                            <Input placeholder="INV-2024-XXXX" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>E-Way Bill No.</Label>
                            <Input placeholder="Optional" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Vehicle Number</Label>
                                <Input placeholder="XX-00-YY-1234" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Driver Name</Label>
                                <Input placeholder="Name..." />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label>Documents to Generate</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" className="justify-start">
                                    <Receipt className="mr-2 h-4 w-4" /> Tax Invoice
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start">
                                    <FileCheck className="mr-2 h-4 w-4" /> COA
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start">
                                    <FileCheck className="mr-2 h-4 w-4" /> Packing List
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start">
                                    <FileCheck className="mr-2 h-4 w-4" /> Delivery Challan
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleDispatch} disabled={!invoiceNo || !vehicleNo} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                            <Truck className="mr-2 h-4 w-4" /> Dispatch & Close SO
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
