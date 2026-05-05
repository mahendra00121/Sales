"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
    CheckCircle,
    Calendar as CalendarIcon,
    Truck,
    Loader2,
    Search
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
import { fetchWithAuth } from "@/lib/api";

// --- Types ---
interface PendingQuote {
    id: number;
    customerName: string;
    description: string;
    quantityRequested: number;
    status: string;
}

interface SalesOrder {
    id: number;
    orderNumber: string;
    customerPONumber: string;
    orderDate: string;
    expectedDeliveryDate: string;
    totalAmount: number;
    status: string;
    inquiry?: PendingQuote;
}

// SO Schema
const soSchema = z.object({
    poNumber: z.string().min(2, "PO Number required"),
    poDate: z.date(),
    deliveryDate: z.date(),
    paymentTerms: z.string().min(2, "Payment terms required"),
    shippingAddress: z.string().min(5, "Address required"),
    priceMatch: z.boolean().refine(val => val === true, "Must confirm price"),
    qtyMatch: z.boolean().refine(val => val === true, "Must confirm qty"),
});

type SalesOrderForm = z.infer<typeof soSchema>;

export default function SalesOrderPage() {
    const [pendingQuotes, setPendingQuotes] = useState<PendingQuote[]>([]);
    const [activeOrders, setActiveOrders] = useState<SalesOrder[]>([]);
    const [selectedQuote, setSelectedQuote] = useState<PendingQuote | null>(null);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const form = useForm<SalesOrderForm>({
        // @ts-ignore
        resolver: zodResolver(soSchema),
        defaultValues: {
            poNumber: "",
            paymentTerms: "Net 30 Days",
            shippingAddress: "",
            priceMatch: false,
            qtyMatch: false,
        },
    });

    // 1. Fetch Data
    const fetchData = async () => {
        try {
            const inqRes = await fetchWithAuth("/SalesInquiry");
            const allInq: PendingQuote[] = await inqRes.json();
            setPendingQuotes(allInq.filter(i => i.status === "QuoteSent"));

            const orderRes = await fetchWithAuth("/SalesOrder");
            const allOrders: SalesOrder[] = await orderRes.json();
            setActiveOrders(allOrders.sort((a,b) => b.id - a.id));
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Confirm Order
    const onConfirmOrder = async (data: SalesOrderForm) => {
        if (!selectedQuote) return;
        setIsLoading(true);

        try {
            const payload = {
                inquiryId: selectedQuote.id,
                orderNumber: "PENDING", // Backend will overwrite
                customerPONumber: data.poNumber,
                orderDate: data.poDate,
                expectedDeliveryDate: data.deliveryDate,
                shippingAddress: data.shippingAddress,
                billingAddress: data.shippingAddress,
                paymentTerms: data.paymentTerms,
                totalAmount: 0,
                advanceReceived: 0,
                shippingCharges: 0,
                status: "Confirmed"
            };

            const response = await fetchWithAuth("/SalesOrder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchData();
                setOpen(false);
                setSelectedQuote(null);
                form.reset();
            } else {
                alert("Order creation failed");
            }
        } catch (error) {
            console.error("Submission Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden p-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">Sales Order Processing</h1>
                    <p className="text-muted-foreground">
                        Convert approved quotations into official Sales Orders.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Pending Table */}
                <Card className="md:col-span-8 shadow-md border-t-4 border-t-blue-600 w-full overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Quotes Awaiting PO</CardTitle>
                            <CardDescription>Waiting for customer purchase order</CardDescription>
                        </div>
                        <Search className="text-muted-foreground h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="whitespace-nowrap">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Quote Ref</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isFetching ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-6"><Loader2 className="animate-spin inline mr-2 text-blue-600" /> Loading...</TableCell></TableRow>
                                    ) : pendingQuotes.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground italic">No quotes ready for conversion.</TableCell></TableRow>
                                    ) : (
                                        pendingQuotes.map((q) => (
                                            <TableRow key={q.id}>
                                                <TableCell className="font-medium text-blue-700 dark:text-blue-300">QTN-{q.id.toString().padStart(4, '0')}</TableCell>
                                                <TableCell>
                                                    <div className="font-bold">{q.customerName}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{q.description}</div>
                                                </TableCell>
                                                <TableCell>{q.quantityRequested?.toLocaleString() ?? "0"}</TableCell>
                                                <TableCell>
                                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-semibold" onClick={() => { setSelectedQuote(q); setOpen(true); }}>
                                                        Convert to SO
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

                {/* Right Sidebar: Active SOs */}
                <Card className="md:col-span-4 h-fit shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Sales Orders</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isFetching ? (
                             <div className="flex justify-center py-6"><Loader2 className="animate-spin text-blue-600" /></div>
                        ) : activeOrders.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground opacity-50 py-10">No orders active.</p>
                        ) : (
                            activeOrders.map(so => (
                                <div key={so.id} className="border-l-4 border-l-green-500 rounded-lg p-4 bg-muted/20 dark:bg-muted/10 space-y-2 hover:bg-muted/40 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-blue-800 dark:text-blue-200">{so.orderNumber}</span>
                                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">Processing</Badge>
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-semibold">{so.inquiry?.customerName}</p>
                                        <p className="text-[10px] text-muted-foreground">PO Ref: {so.customerPONumber}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-blue-600 pt-2 border-t mt-2">
                                        <Truck className="h-3 w-3" />
                                        <span>Deadline: {format(new Date(so.expectedDeliveryDate), 'dd MMM yyyy')}</span>
                                    </div>
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
                        <DialogTitle>Confirm Order: INQ-{selectedQuote?.id.toString().padStart(4, '0')}</DialogTitle>
                        <DialogDescription>Validate customer PO and generate official Sales Order.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onConfirmOrder)} className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 space-y-3">
                            <h4 className="font-bold text-blue-800 dark:text-blue-200 text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Compliance Check</h4>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="priceMatch" className="h-4 w-4 accent-blue-600" {...form.register("priceMatch")} />
                                    <Label htmlFor="priceMatch" className="text-sm">PO Price matches Quoted Price</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="qtyMatch" className="h-4 w-4 accent-blue-600" {...form.register("qtyMatch")} />
                                    <Label htmlFor="qtyMatch" className="text-sm">PO Quantity matches Quoted Quantity</Label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>PO Number</Label>
                                <Input {...form.register("poNumber")} placeholder="PO/2024/XXX" />
                            </div>
                            <div className="space-y-2">
                                <Label>PO Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className="w-full text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.watch("poDate") ? format(form.watch("poDate"), "PPP") : <span>Pick PO date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={form.watch("poDate")} onSelect={(d) => d && form.setValue("poDate", d)} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Payment Terms</Label>
                                <Select onValueChange={(v) => form.setValue("paymentTerms", v)} defaultValue="Net 30 Days">
                                    <SelectTrigger><SelectValue placeholder="Terms" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Advance">100% Advance</SelectItem>
                                        <SelectItem value="Net 30 Days">Net 30 Days</SelectItem>
                                        <SelectItem value="Net 60 Days">Net 60 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Delivery Deadline</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className="w-full text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.watch("deliveryDate") ? format(form.watch("deliveryDate"), "PPP") : <span>Select deadline</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={form.watch("deliveryDate")} onSelect={(d) => d && form.setValue("deliveryDate", d)} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Shipping Address</Label>
                            <Input {...form.register("shippingAddress")} placeholder="Full delivery address..." />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading} className="w-full bg-blue-800 hover:bg-blue-900 text-white py-6">
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Confirm Order & Generate SO"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
