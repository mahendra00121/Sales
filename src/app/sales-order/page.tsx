"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
    CheckCircle,
    Calendar as CalendarIcon,
    Truck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock Data: Approved Inquiries/Quotes ready for SO
interface PendingQuote {
    quoteId: string;
    customer: string;
    product: string;
    quantity: number;
    price: number;
    totalValue: number;
    status: string;
}

interface GeneratedSO extends PendingQuote {
    soNumber: string;
    poNumber: string;
    orderDate: Date;
    deliveryDate: Date;
    paymentTerms: string;
    shippingAddress: string;
}

const pendingOrders: PendingQuote[] = [
    {
        quoteId: "QT-2024-521",
        customer: "Acme Corp",
        product: "Food Tray 500ml",
        quantity: 50000,
        price: 0.125,
        totalValue: 6250,
        status: "Quote Sent",
    },
    {
        quoteId: "QT-2024-528",
        customer: "Fresh Foods Ltd",
        product: "Burger Box",
        quantity: 25000,
        price: 0.18,
        totalValue: 4500,
        status: "Quote Approved",
    }
];

// SO Schema
const soSchema = z.object({
    poNumber: z.string().min(2, "PO Number required"),
    poDate: z.date(),
    deliveryDate: z.date(),
    paymentTerms: z.string().min(2, "Payment terms required"),
    shippingAddress: z.string().min(5, "Address required"),
    priceMatch: z.boolean().refine(val => val === true, { message: "Must confirm price matches" }),
    qtyMatch: z.boolean().refine(val => val === true, { message: "Must confirm quantity matches" }),
});

type SalesOrderForm = z.infer<typeof soSchema>;

export default function SalesOrderPage() {
    const [orders, setOrders] = useState<PendingQuote[]>(pendingOrders);
    const [generatedSO, setGeneratedSO] = useState<GeneratedSO[]>([]);
    const [selectedQuote, setSelectedQuote] = useState<PendingQuote | null>(null);
    const [open, setOpen] = useState(false);

    const form = useForm<SalesOrderForm>({
        resolver: zodResolver(soSchema),
        defaultValues: {
            poNumber: "",
            paymentTerms: "Net 30 Days",
            shippingAddress: "",
            priceMatch: false,
            qtyMatch: false,
        },
    });

    const onConfirmOrder = (data: SalesOrderForm) => {
        if (!selectedQuote) return;

        const newSO = {
            soNumber: `SO-${new Date().getFullYear()}-${generatedSO.length + 101}`,
            ...selectedQuote,
            ...data,
            status: "Confirmed",
            orderDate: new Date(),
        };

        setGeneratedSO([newSO, ...generatedSO]);
        // Remove from pending 
        setOrders(orders.filter(o => o.quoteId !== selectedQuote.quoteId));
        setOpen(false);
        form.reset();

        // Simulate System Output
        alert(`Sales Order ${newSO.soNumber} Generated!\n\nProduction Requirement Triggered automatically.`);
    };

    // ... (rest of the component)

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales Order Processing</h1>
                    <p className="text-muted-foreground">
                        Convert approved quotations into official Sales Orders.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Pending Quotes List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Pending Confirmations</CardTitle>
                        <CardDescription>Quotations awaiting Purchase Order (PO)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {orders.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                No pending quotes to process.
                            </div>
                        ) : (
                            <div className="overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Quote #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order.quoteId}>
                                                <TableCell className="font-medium">{order.quoteId}</TableCell>
                                                <TableCell>
                                                    <div>{order.customer}</div>
                                                    <div className="text-xs text-muted-foreground">{order.product}</div>
                                                </TableCell>
                                                <TableCell>${order.totalValue.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedQuote(order);
                                                            setOpen(true);
                                                        }}
                                                    >
                                                        Create SO
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                    </CardContent>
                </Card>

                {/* Recent SOs */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Recent Sales Orders</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {generatedSO.length === 0 ? (
                            <div className="text-muted-foreground text-sm text-center py-4">
                                No orders generated yet.
                            </div>
                        ) : (
                            generatedSO.map(so => (
                                <div key={so.soNumber} className="border rounded-lg p-3 bg-muted/20 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-primary">{so.soNumber}</span>
                                        <Badge className="bg-green-600">Active</Badge>
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium">{so.customer}</p>
                                        <p className="text-xs text-muted-foreground">PO: {so.poNumber}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t mt-2">
                                        <Truck className="h-3 w-3" />
                                        <span>Due: {format(so.deliveryDate, 'MMM d, yyyy')}</span>
                                    </div>
                                    <Badge variant="secondary" className="w-full justify-center text-[10px] bg-blue-100 text-blue-800 hover:bg-blue-100">
                                        Production Triggered
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create SO Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Sales Order</DialogTitle>
                        <DialogDescription>
                            Validate PO details against Quote: {selectedQuote?.quoteId}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onConfirmOrder)} className="space-y-6">
                        {/* Validation Section */}
                        <div className="bg-muted p-4 rounded-lg space-y-3 border-l-4 border-l-blue-500">
                            <h4 className="font-semibold text-sm">1. Validate PO vs Quote</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Quoted Price:</span>
                                    <span className="font-medium">${selectedQuote?.price.toFixed(3)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Quoted Qty:</span>
                                    <span className="font-medium">{selectedQuote?.quantity.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="priceMatch"
                                        className="h-4 w-4 rounded border-gray-300"
                                        {...form.register("priceMatch")}
                                    />
                                    <label htmlFor="priceMatch" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        PO Price matches Quoted Price
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="qtyMatch"
                                        className="h-4 w-4 rounded border-gray-300"
                                        {...form.register("qtyMatch")}
                                    />
                                    <label htmlFor="qtyMatch" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        PO Quantity matches Quoted Quantity
                                    </label>
                                </div>
                                {(form.formState.errors.priceMatch || form.formState.errors.qtyMatch) &&
                                    <p className="text-xs text-red-500">You must validate these items to proceed.</p>
                                }
                            </div>
                        </div>

                        {/* PO Entry Section */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm">2. Enter Purchase Order Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>PO Number</Label>
                                    <Input {...form.register("poNumber")} placeholder="PO-12345" />
                                    {form.formState.errors.poNumber && <span className="text-xs text-red-500">{form.formState.errors.poNumber.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>PO Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full text-left font-normal",
                                                    !form.watch("poDate") && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {form.watch("poDate") ? format(form.watch("poDate"), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={form.watch("poDate")}
                                                onSelect={(date) => {
                                                    if (date) form.setValue("poDate", date)
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Payment Terms</Label>
                                    <Select onValueChange={(val) => form.setValue("paymentTerms", val)} defaultValue="Net 30 Days">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select terms" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Advance">100% Advance</SelectItem>
                                            <SelectItem value="Net 30 Days">Net 30 Days</SelectItem>
                                            <SelectItem value="Net 60 Days">Net 60 Days</SelectItem>
                                            <SelectItem value="LC">Letter of Credit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Delivery Deadline</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full text-left font-normal",
                                                    !form.watch("deliveryDate") && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {form.watch("deliveryDate") ? format(form.watch("deliveryDate"), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={form.watch("deliveryDate")}
                                                onSelect={(date) => {
                                                    if (date) form.setValue("deliveryDate", date)
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Shipping Address</Label>
                                <Input {...form.register("shippingAddress")} placeholder="Delivery location..." />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit" className="w-full">Confirm Order & Generate SO</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
