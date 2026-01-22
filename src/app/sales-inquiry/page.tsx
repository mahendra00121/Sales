"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
    Calendar as CalendarIcon,
    FileSearch,
    Plus,
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

// Define Schema
const formSchema = z.object({
    customerName: z.string().min(2, {
        message: "Customer name must be at least 2 characters.",
    }),
    contactPerson: z.string().min(2, {
        message: "Contact person is required.",
    }),
    productType: z.string({
        message: "Please select a product type.",
    }),
    material: z.string({
        message: "Please select a material.",
    }),
    quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Quantity must be a positive number.",
    }),
    targetDate: z.date({
        message: "Target delivery date is required.",
    }),
    specialReq: z.string().optional(),
});

// Mock Data
const initialInquiries = [
    {
        id: "INQ-2024-001",
        customer: "Acme Corp",
        product: "Food Tray 500ml",
        material: "PET",
        quantity: 50000,
        date: "2024-01-15",
        status: "Pending",
    },
    {
        id: "INQ-2024-002",
        customer: "Fresh Foods Ltd",
        product: "Burger Box",
        material: "HIPS",
        quantity: 25000,
        date: "2024-01-16",
        status: "Feasible",
    },
    {
        id: "INQ-2024-003",
        customer: "MediPack Inc",
        product: "Blister Pack",
        material: "PVC",
        quantity: 100000,
        date: "2024-01-18",
        status: "Processed",
    },
];

export default function SalesInquiryPage() {
    const [inquiries, setInquiries] = useState(initialInquiries);
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customerName: "",
            contactPerson: "",
            quantity: "",
            specialReq: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const newInquiry = {
            id: `INQ-2024-${String(inquiries.length + 1).padStart(3, "0")}`,
            customer: values.customerName,
            product: values.productType,
            material: values.material,
            quantity: Number(values.quantity),
            date: format(new Date(), "yyyy-MM-dd"), // Current date
            status: "Pending",
        };

        setInquiries([newInquiry, ...inquiries]);
        setOpen(false);
        form.reset();
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
                        <Button className="w-full md:w-auto">
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
                                        <span className="text-red-500 text-sm">
                                            {form.formState.errors.customerName.message}
                                        </span>
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
                                        <span className="text-red-500 text-sm">
                                            {form.formState.errors.contactPerson.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Product Type</Label>
                                    <Select
                                        onValueChange={(value) =>
                                            form.setValue("productType", value)
                                        }
                                        defaultValue={form.getValues("productType")}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Food Tray">Food Tray</SelectItem>
                                            <SelectItem value="Blister Pack">Blister Pack</SelectItem>
                                            <SelectItem value="Clamshell">Clamshell</SelectItem>
                                            <SelectItem value="Industrial Tray">
                                                Industrial Tray
                                            </SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.productType && (
                                        <span className="text-red-500 text-sm">
                                            {form.formState.errors.productType.message}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Material Preference</Label>
                                    <Select
                                        onValueChange={(value) => form.setValue("material", value)}
                                        defaultValue={form.getValues("material")}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Material" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PET">PET (Polyethylene Terephthalate)</SelectItem>
                                            <SelectItem value="PVC">PVC (Polyvinyl Chloride)</SelectItem>
                                            <SelectItem value="HIPS">HIPS (High Impact Polystyrene)</SelectItem>
                                            <SelectItem value="PP">PP (Polypropylene)</SelectItem>
                                            <SelectItem value="Biodegradable">Biodegradable / PLA</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.material && (
                                        <span className="text-red-500 text-sm">
                                            {form.formState.errors.material.message}
                                        </span>
                                    )}
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
                                    {form.formState.errors.quantity && (
                                        <span className="text-red-500 text-sm">
                                            {form.formState.errors.quantity.message}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2 flex flex-col pt-1">
                                    <Label className="mb-1">Target Delivery Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !form.watch("targetDate") && "text-muted-foreground"
                                                )}
                                            >
                                                {form.watch("targetDate") ? (
                                                    format(form.watch("targetDate"), "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={form.watch("targetDate")}
                                                onSelect={(date) => {
                                                    if (date) form.setValue("targetDate", date);
                                                }}
                                                disabled={(date) =>
                                                    date < new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {form.formState.errors.targetDate && (
                                        <span className="text-red-500 text-sm">
                                            {form.formState.errors.targetDate.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="specialReq">Special Requirements</Label>
                                <Textarea
                                    id="specialReq"
                                    placeholder="e.g. Food Grade Certificate required, Custom Color Pantone 286C"
                                    {...form.register("specialReq")}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="submit">Submit Inquiry</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Inquiries</CardTitle>
                    <CardDescription>
                        List of all sales inquiries and their current status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Material</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inquiries.map((inquiry) => (
                                    <TableRow key={inquiry.id}>
                                        <TableCell className="font-medium">{inquiry.id}</TableCell>
                                        <TableCell>{inquiry.customer}</TableCell>
                                        <TableCell>{inquiry.product}</TableCell>
                                        <TableCell>{inquiry.material}</TableCell>
                                        <TableCell>{inquiry.quantity.toLocaleString()}</TableCell>
                                        <TableCell>{inquiry.date}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    inquiry.status === "Pending"
                                                        ? "default"
                                                        : inquiry.status === "Feasible"
                                                            ? "secondary"
                                                            : "outline"
                                                }
                                                className={cn(
                                                    inquiry.status === "Feasible" && "bg-green-600 hover:bg-green-700 text-white",
                                                    inquiry.status === "Processed" && "text-muted-foreground"
                                                )}
                                            >
                                                {inquiry.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <FileSearch className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
