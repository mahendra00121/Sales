"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
    Calendar as CalendarIcon,
    FileSearch,
    Plus,
    Loader2,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";

// Define Schema matching Backend Requirements
const formSchema = z.object({
    customerName: z.string().min(2, "Customer name is required"),
    contactPerson: z.string().min(2, "Contact person is required"),
    contactEmail: z.string().email("Invalid email").optional(),
    contactNumber: z.string().optional(),
    productType: z.string().min(1, "Select Product"),
    material: z.string().min(1, "Select Material"),
    quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Positive number required"),
    targetDate: z.date({ 
        message: "Target delivery date is required",
    }),
    specialReq: z.string().optional(),
});

type SalesInquiryData = {
    id: number;
    customerName: string;
    contactPerson: string;
    description: string;
    quantityRequested: number;
    inquiryDate: string;
    status: string;
};

type MasterData = {
    id: number;
    name: string;
    category: string;
    isActive: boolean;
};

export default function SalesInquiryPage() {
    const [inquiries, setInquiries] = useState<SalesInquiryData[]>([]);
    const [productTypes, setProductTypes] = useState<MasterData[]>([]);
    const [materials, setMaterials] = useState<MasterData[]>([]);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customerName: "",
            contactPerson: "",
            contactEmail: "",
            contactNumber: "",
            quantity: "",
            specialReq: "",
        },
    });

    // 1. Fetch Inquiries from Backend
    const fetchInquiries = async () => {
        try {
            const response = await fetchWithAuth("/SalesInquiry");
            if (response.ok) {
                const data = await response.json();
                setInquiries(data);
            }
        } catch (error) {
            console.error("Failed to fetch inquiries:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const fetchMasterData = async () => {
        try {
            const [ptRes, mRes] = await Promise.all([
                fetchWithAuth("/MasterData?category=ProductType"),
                fetchWithAuth("/MasterData?category=MaterialPreference")
            ]);

            if (ptRes.ok) setProductTypes((await ptRes.json()).filter((item: MasterData) => item.isActive));
            if (mRes.ok) setMaterials((await mRes.json()).filter((item: MasterData) => item.isActive));
        } catch (error) {
            console.error("Failed to fetch master data:", error);
        }
    };

    useEffect(() => {
        fetchInquiries();
        fetchMasterData();
    }, []);

    // 2. Submit New Inquiry to Backend
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const payload = {
                customerName: values.customerName,
                contactPerson: values.contactPerson,
                contactEmail: values.contactEmail || "",
                contactNumber: values.contactNumber || "",
                description: `${values.productType} (${values.material}). ${values.specialReq || ""}`,
                quantityRequested: Number(values.quantity),
                customerExpectedDate: values.targetDate,
                status: "New"
            };

            const response = await fetchWithAuth("/SalesInquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchInquiries(); // Refresh list
                setOpen(false);
                form.reset();
            } else {
                alert("Failed to submit inquiry");
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Error connecting to server");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sales Inquiry Management</h1>
                    <p className="text-muted-foreground">
                        Capture and track new customer inquiries and leads.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> New Inquiry
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Inquiry</DialogTitle>
                            <DialogDescription>
                                Enter customer details and product requirements here.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Customer Name</Label>
                                    <Input
                                        id="customerName"
                                        placeholder="e.g. Acme Corp"
                                        {...form.register("customerName")}
                                    />
                                    {form.formState.errors.customerName && (
                                        <p className="text-blue-500 text-xs">{form.formState.errors.customerName.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactPerson">Contact Person</Label>
                                    <Input
                                        id="contactPerson"
                                        placeholder="e.g. John Doe"
                                        {...form.register("contactPerson")}
                                    />
                                    {form.formState.errors.contactPerson && (
                                        <p className="text-blue-500 text-xs">{form.formState.errors.contactPerson.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Email</Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        placeholder="client@example.com"
                                        {...form.register("contactEmail")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactNumber">Contact Number</Label>
                                    <Input
                                        id="contactNumber"
                                        placeholder="+91 XXXXX XXXXX"
                                        {...form.register("contactNumber")}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Product Type</Label>
                                    <Select onValueChange={(v) => form.setValue("productType", v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {productTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.name}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                            {productTypes.length === 0 && (
                                                <SelectItem value="none" disabled>No products configured</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Material Preference</Label>
                                    <Select onValueChange={(v) => form.setValue("material", v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Material" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {materials.map((mat) => (
                                                <SelectItem key={mat.id} value={mat.name}>
                                                    {mat.name}
                                                </SelectItem>
                                            ))}
                                            {materials.length === 0 && (
                                                <SelectItem value="none" disabled>No materials configured</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        placeholder="e.g. 50000"
                                        {...form.register("quantity")}
                                    />
                                </div>
                                <div className="space-y-2 flex flex-col">
                                    <Label className="mb-2">Target Delivery Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !form.watch("targetDate") && "text-muted-foreground")}>
                                                {form.watch("targetDate") ? format(form.watch("targetDate"), "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={form.watch("targetDate")}
                                                onSelect={(date) => date && form.setValue("targetDate", date)}
                                                disabled={(date) => date < new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="specialReq">Special Requirements</Label>
                                <Textarea
                                    id="specialReq"
                                    placeholder="Enter any custom requirements..."
                                    {...form.register("specialReq")}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Inquiry"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Inquiries</CardTitle>
                    <CardDescription>
                        Real-time list of customer inquiries from the database.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Inquiry Details</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isFetching ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-10">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                                            <p className="mt-2 text-muted-foreground">Loading inquiries...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : inquiries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                            No inquiries found. Create your first inquiry!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    inquiries.map((inquiry) => (
                                        <TableRow key={inquiry.id}>
                                            <TableCell className="font-medium">INQ-{inquiry.id.toString().padStart(4, '0')}</TableCell>
                                            <TableCell className="font-semibold">{inquiry.customerName}</TableCell>
                                            <TableCell>{inquiry.contactPerson}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">{inquiry.description}</TableCell>
                                            <TableCell>{inquiry.quantityRequested?.toLocaleString()}</TableCell>
                                            <TableCell>{format(new Date(inquiry.inquiryDate), "dd MMM yyyy")}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(
                                                    inquiry.status === "New" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                                                    inquiry.status === "FeasibilityApproved" && "bg-blue-50 text-blue-700 border-blue-200",
                                                    inquiry.status === "Rejected" && "bg-blue-50 text-blue-700 border-blue-200"
                                                )}>
                                                    {inquiry.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon">
                                                    <FileSearch className="h-4 w-4 text-blue-600" />
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
        </div>
    );
}
