"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
    Calendar as CalendarIcon,
    FileSearch,
    Plus,
    Loader2,
    ShieldCheck,
    Mail,
    Download,
    FileSpreadsheet,
    FileText as FilePdf,
    FileJson,
    Search,
    Filter,
    X,
    CalendarDays,
    Edit3,
    History,
    Activity
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import { PageWrapper } from "@/components/PageWrapper";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

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
    const [otpStep, setOtpStep] = useState(false);
    const [tempInquiryId, setTempInquiryId] = useState<number | null>(null);
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [editingInquiry, setEditingInquiry] = useState<SalesInquiryData | null>(null);
    const [analysisOpen, setAnalysisOpen] = useState(false);
    const [selectedInquiryForAnalysis, setSelectedInquiryForAnalysis] = useState<any>(null);
    const [inquiryLogs, setInquiryLogs] = useState<any[]>([]);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });

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

    const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = form;

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
                id: editingInquiry?.id,
                customerName: values.customerName,
                contactPerson: values.contactPerson,
                contactEmail: values.contactEmail || "",
                contactNumber: values.contactNumber || "",
                description: `${values.productType} (${values.material}). ${values.specialReq || ""}`,
                quantityRequested: Number(values.quantity),
                customerExpectedDate: values.targetDate,
                inquiryDate: editingInquiry ? editingInquiry.inquiryDate : new Date(),
                status: editingInquiry ? editingInquiry.status : "New"
            };

            if (editingInquiry) {
                // Update Existing
                const response = await fetchWithAuth(`/SalesInquiry/${editingInquiry.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    toast.success("Inquiry updated successfully!");
                    await fetchInquiries();
                    setOpen(false);
                    setEditingInquiry(null);
                    reset();
                } else {
                    toast.error("Failed to update inquiry.");
                }
            } else {
                // Create New
                const response = await fetchWithAuth("/SalesInquiry", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    const data = await response.json();
                    setTempInquiryId(data.id);
                    setOtpStep(true); // Move to OTP step
                    toast.success("Verification code sent to your email.");
                } else {
                    toast.error("Failed to initiate inquiry verification.");
                }
            }
        } catch (error) {
            console.error("Submission Error:", error);
            toast.error("Error connecting to server.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleVerifyOtp() {
        const otpValue = otpDigits.join("");
        if (!tempInquiryId || otpValue.length < 6) return;
        setIsLoading(true);
        setOtpError(null);

        try {
            const response = await fetchWithAuth("/SalesInquiry/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inquiryId: tempInquiryId,
                    otp: otpValue
                }),
            });

            if (response.ok) {
                await fetchInquiries();
                setOpen(false);
                setOtpStep(false);
                setTempInquiryId(null);
                setOtpDigits(["", "", "", "", "", ""]);
                setOtpError(null);
                reset();
                toast.success("Inquiry submitted and verified successfully!"); 
            } else {
                const error = await response.text();
                setOtpError(error || "Invalid OTP. Please try again.");
                toast.error("Verification failed.");
            }
        } catch (error) {
            console.error("Verification Error:", error);
            toast.error("Error connecting to server.");
        } finally {
            setIsLoading(false);
        }
    }

    const resetForm = () => {
        setEditingInquiry(null);
        setOtpStep(false);
        setTempInquiryId(null);
        setOtpDigits(["", "", "", "", "", ""]);
        setOtpError(null);
        reset({
            customerName: "",
            contactPerson: "",
            contactEmail: "",
            contactNumber: "",
            quantity: "",
            specialReq: "",
            productType: "",
            material: "",
            targetDate: undefined
        });
    };

    const handleEdit = (inquiry: any) => {
        setEditingInquiry(inquiry);
        
        // Parse description to extract product and material
        // Format: "Product (Material). SpecialReq"
        const desc = inquiry.description || "";
        const prodMatch = desc.match(/^(.*?)\s\(/);
        const matMatch = desc.match(/\((.*?)\)/);
        const reqMatch = desc.match(/\.\s(.*)$/);

        setValue("customerName", inquiry.customerName);
        setValue("contactPerson", inquiry.contactPerson);
        setValue("contactEmail", inquiry.contactEmail || "");
        setValue("contactNumber", inquiry.contactNumber || "");
        setValue("quantity", inquiry.quantityRequested.toString());
        setValue("targetDate", new Date(inquiry.customerExpectedDate || inquiry.inquiryDate));
        setValue("productType", prodMatch ? prodMatch[1] : "");
        setValue("material", matMatch ? matMatch[1] : "");
        setValue("specialReq", reqMatch ? reqMatch[1] : "");
        
        setOpen(true);
    };

    const handleFullAnalysis = async (inquiry: any) => {
        setSelectedInquiryForAnalysis(inquiry);
        setAnalysisOpen(true);
        try {
            const res = await fetchWithAuth(`/SalesInquiry/${inquiry.id}/logs`);
            if (res.ok) {
                setInquiryLogs(await res.json());
            }
        } catch (error) {
            console.error("Log fetch error:", error);
        }
    };

    const handleExportExcel = () => {
        const dataToExport = inquiries.map(iq => ({
            "Inquiry ID": `INQ-${iq.id.toString().padStart(4, '0')}`,
            "Customer Name": iq.customerName,
            "Contact Person": iq.contactPerson,
            "Description": iq.description,
            "Quantity": iq.quantityRequested?.toLocaleString() || "0",
            "Date": format(new Date(iq.inquiryDate), "dd MMM yyyy"),
            "Status": iq.status
        }));
        exportToExcel(dataToExport, `Sales_Inquiries_${format(new Date(), "yyyyMMdd")}`);
    };

    const handleExportPDF = () => {
        const headers = ["ID", "Customer", "Contact", "Quantity", "Date", "Status"];
        const data = inquiries.map(iq => [
            `INQ-${iq.id.toString().padStart(4, '0')}`,
            iq.customerName,
            iq.contactPerson,
            iq.quantityRequested?.toLocaleString() || "0",
            format(new Date(iq.inquiryDate), "dd MMM yyyy"),
            iq.status
        ]);
        exportToPDF(headers, data, `Sales_Inquiries_${format(new Date(), "yyyyMMdd")}`, "Sales Inquiry Report");
    };

    const filteredInquiries = inquiries.filter(iq => {
        const matchesSearch = iq.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              `INQ-${iq.id.toString().padStart(4, '0')}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || iq.status === statusFilter;
        
        const iqDate = new Date(iq.inquiryDate);
        iqDate.setHours(0,0,0,0);
        
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        if (fromDate) fromDate.setHours(0,0,0,0);
        
        const toDate = dateRange.to ? new Date(dateRange.to) : null;
        if (toDate) toDate.setHours(23,59,59,999);

        const matchesDate = (!fromDate || iqDate >= fromDate) && 
                            (!toDate || iqDate <= toDate);
        
        return matchesSearch && matchesStatus && matchesDate;
    });

    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter("All");
        setDateRange({ from: undefined, to: undefined });
    };

    return (
        <PageWrapper>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sales Inquiry Management</h1>
                        <p className="text-muted-foreground">
                            Capture and track new customer inquiries and leads.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full md:w-auto border-blue-200 text-blue-600 hover:bg-blue-50 font-bold rounded-xl h-11">
                                    <Download className="mr-2 h-4 w-4" /> Export Report
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="rounded-2xl w-56 p-2 shadow-2xl border-none bg-white dark:bg-slate-900">
                                <DropdownMenuLabel className="text-xs font-black uppercase text-slate-400 p-2">Select Format</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleExportExcel} className="rounded-xl py-3 cursor-pointer font-bold group">
                                    <FileSpreadsheet className="mr-3 h-4 w-4 text-green-600" /> Export to Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportPDF} className="rounded-xl py-3 cursor-pointer font-bold group">
                                    <FilePdf className="mr-3 h-4 w-4 text-rose-600" /> Export to PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Dialog open={open} onOpenChange={(val) => {
                            setOpen(val);
                            if (!val) {
                                setOtpStep(false);
                                setTempInquiryId(null);
                                setOtpDigits(["", "", "", "", "", ""]);
                                setOtpError(null);
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button 
                                    onClick={resetForm}
                                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 font-bold rounded-xl h-11 px-6 shadow-lg shadow-blue-100 dark:shadow-none"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> New Inquiry
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {otpStep ? "Verify Your Email" : editingInquiry ? "Update Inquiry Details" : "Create New Inquiry"}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {otpStep 
                                            ? "We have sent a 6-digit code to your email. Please enter it below to confirm." 
                                            : "Enter customer details and product requirements here."}
                                    </DialogDescription>
                                </DialogHeader>

                                {otpStep ? (
                                    <div className="space-y-8 py-8 animate-in fade-in zoom-in duration-300">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                                                <ShieldCheck className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Confirm Identity</h3>
                                                <p className="text-sm text-slate-500 mt-1">We've sent a code to your registered email</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-center gap-2 mb-2">
                                                    <Mail className="h-4 w-4 text-slate-400" />
                                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Verification Code</span>
                                                </div>
                                                
                                                <div className="flex justify-center gap-2 md:gap-4">
                                                    {otpDigits.map((digit, index) => (
                                                        <Input
                                                            key={index}
                                                            ref={(el) => { otpRefs.current[index] = el; }}
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={1}
                                                            className="w-10 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 border-blue-100 dark:border-blue-900/30 focus:border-blue-600 dark:focus:border-blue-400 rounded-xl bg-white dark:bg-slate-900"
                                                            value={digit}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, "");
                                                                const newDigits = [...otpDigits];
                                                                newDigits[index] = val ? val.substring(val.length - 1) : "";
                                                                setOtpDigits(newDigits);
                                                                setOtpError(null);
                                                                if (val && index < 5) {
                                                                    otpRefs.current[index + 1]?.focus();
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
                                                                    otpRefs.current[index - 1]?.focus();
                                                                } else if (e.key === "ArrowRight" && index < 5) {
                                                                    otpRefs.current[index + 1]?.focus();
                                                                } else if (e.key === "ArrowLeft" && index > 0) {
                                                                    otpRefs.current[index - 1]?.focus();
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </div>

                                                {otpError && (
                                                    <div className="flex items-center justify-center gap-2 text-rose-600 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg">
                                                        <span className="text-sm font-semibold">{otpError}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="pt-2">
                                                <Button 
                                                    onClick={handleVerifyOtp} 
                                                    disabled={isLoading || otpDigits.some(d => !d)}
                                                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold rounded-2xl transition-all"
                                                >
                                                    {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Complete Verification"}
                                                </Button>
                                            </div>

                                            <div className="flex justify-center pt-4">
                                                <button 
                                                    type="button" 
                                                    className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors flex items-center gap-1" 
                                                    onClick={() => setOtpStep(false)}
                                                >
                                                    ← Back to form
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="customerName" className={cn(errors.customerName && "text-rose-500")}>Customer Name</Label>
                                                <Input id="customerName" placeholder="e.g. Reliance Industries" {...register("customerName")} className={cn(errors.customerName && "border-rose-500 focus:ring-rose-500")} />
                                                {errors.customerName && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase">{errors.customerName.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contactPerson" className={cn(errors.contactPerson && "text-rose-500")}>Contact Person</Label>
                                                <Input id="contactPerson" placeholder="e.g. Mr. Rajesh Kumar" {...register("contactPerson")} className={cn(errors.contactPerson && "border-rose-500 focus:ring-rose-500")} />
                                                {errors.contactPerson && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase">{errors.contactPerson.message}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contactEmail" className={cn(errors.contactEmail && "text-rose-500")}>Email</Label>
                                                <Input id="contactEmail" type="email" placeholder="example@company.com" {...register("contactEmail")} className={cn(errors.contactEmail && "border-rose-500 focus:ring-rose-500")} />
                                                {errors.contactEmail && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase">{errors.contactEmail.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contactNumber">Contact Number</Label>
                                                <Input id="contactNumber" placeholder="+91 98765-43210" {...register("contactNumber")} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className={cn(errors.productType && "text-rose-500")}>Product Type</Label>
                                                <Select onValueChange={(v) => setValue("productType", v)}>
                                                    <SelectTrigger className={cn(errors.productType && "border-rose-500")}><SelectValue placeholder="Select Product" /></SelectTrigger>
                                                    <SelectContent className="rounded-xl border-none shadow-2xl">
                                                        {productTypes.map((type) => (
                                                            <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.productType && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase">{errors.productType.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className={cn(errors.material && "text-rose-500")}>Material Preference</Label>
                                                <Select onValueChange={(v) => setValue("material", v)}>
                                                    <SelectTrigger className={cn(errors.material && "border-rose-500")}><SelectValue placeholder="Select Material" /></SelectTrigger>
                                                    <SelectContent className="rounded-xl border-none shadow-2xl">
                                                        {materials.map((mat) => (
                                                            <SelectItem key={mat.id} value={mat.name}>{mat.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.material && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase">{errors.material.message}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="quantity" className={cn(errors.quantity && "text-rose-500")}>Quantity</Label>
                                                <Input id="quantity" type="number" placeholder="Enter requested units" {...register("quantity")} className={cn(errors.quantity && "border-rose-500 focus:ring-rose-500")} />
                                                {errors.quantity && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase">{errors.quantity.message}</p>}
                                            </div>
                                            <div className="space-y-2 flex flex-col">
                                                <Label className={cn("mb-2", errors.targetDate && "text-rose-500")}>Target Delivery Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className={cn("w-full pl-3 text-left font-normal h-11 rounded-xl", !watch("targetDate") && "text-muted-foreground", errors.targetDate && "border-rose-500")}>
                                                            {watch("targetDate") ? format(watch("targetDate"), "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={watch("targetDate")}
                                                            onSelect={(date) => date && setValue("targetDate", date)}
                                                            disabled={(date) => date < new Date()}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.targetDate && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase">{errors.targetDate.message}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="specialReq">Special Requirements</Label>
                                            <Textarea id="specialReq" placeholder="Enter mold details, specific packaging, or quality notes..." {...register("specialReq")} className="rounded-xl min-h-[100px]" />
                                        </div>

                                        <DialogFooter>
                                            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl shadow-lg">
                                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Inquiry"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Advanced Filters Section */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Search & Filters</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4 relative group">
                            <Search className="absolute left-3 top-3.2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input 
                                placeholder="Search Customer or Inquiry ID..." 
                                className="pl-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-3">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none">
                                    <SelectValue placeholder="Status: All" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                    <SelectItem value="All">All Statuses</SelectItem>
                                    <SelectItem value="New">New Inquiry</SelectItem>
                                    <SelectItem value="FeasibilityApproved">Feasibility Approved</SelectItem>
                                    <SelectItem value="QuoteSent">Quote Sent</SelectItem>
                                    <SelectItem value="Ordered">Ordered</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-3 flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn(
                                        "w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none text-left font-normal",
                                        !dateRange.from && "text-slate-400"
                                    )}>
                                        <CalendarDays className="mr-2 h-4 w-4 opacity-50" />
                                        {dateRange.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Filter by Date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange.from}
                                        selected={{ from: dateRange.from, to: dateRange.to }}
                                        onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="md:col-span-2">
                            <Button 
                                variant="ghost" 
                                onClick={resetFilters}
                                className="w-full h-11 rounded-xl font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            >
                                <X className="mr-2 h-4 w-4" /> Reset
                            </Button>
                        </div>
                    </div>
                </div>

                <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900/50">
                    <CardHeader>
                        <CardTitle>Recent Inquiries</CardTitle>
                        <CardDescription>Real-time list of customer inquiries from the database.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <div className="overflow-auto w-full max-w-[calc(100vw-2rem)]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead className="hidden md:table-cell">Contact Person</TableHead>
                                        <TableHead>Inquiry Details</TableHead>
                                        <TableHead className="hidden lg:table-cell">Quantity</TableHead>
                                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isFetching ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i} className="hover:bg-transparent">
                                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                                <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                                                <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredInquiries.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-20 text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                                                    <Search className="h-12 w-12" />
                                                    <p className="font-bold">No matching inquiries found</p>
                                                    <Button variant="link" onClick={resetFilters} className="text-blue-600">Clear all filters</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredInquiries.map((inquiry) => (
                                            <TableRow key={inquiry.id}>
                                                <TableCell className="font-medium">INQ-{inquiry.id.toString().padStart(4, '0')}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">{inquiry.customerName}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase md:hidden">{inquiry.contactPerson}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">{inquiry.contactPerson}</TableCell>
                                                <TableCell className="max-w-[150px] sm:max-w-[200px] truncate">{inquiry.description}</TableCell>
                                                <TableCell className="hidden lg:table-cell">{inquiry.quantityRequested?.toLocaleString()}</TableCell>
                                                <TableCell className="hidden sm:table-cell">{format(new Date(inquiry.inquiryDate), "dd MMM yyyy")}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={cn(
                                                        "font-bold px-3 py-1 rounded-full",
                                                        inquiry.status === "New" && "bg-blue-50 text-blue-700 border-blue-200",
                                                        inquiry.status === "FeasibilityApproved" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                                        inquiry.status === "QuoteSent" && "bg-amber-50 text-amber-700 border-amber-200",
                                                        inquiry.status === "Ordered" && "bg-indigo-50 text-indigo-700 border-indigo-200",
                                                        inquiry.status === "Rejected" && "bg-rose-50 text-rose-700 border-rose-200"
                                                    )}>
                                                        {inquiry.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                                                <Filter className="h-4 w-4 text-slate-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-2xl p-2 border-none shadow-2xl bg-white dark:bg-slate-900">
                                                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 p-2">Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleEdit(inquiry)} className="rounded-xl py-2.5 cursor-pointer font-bold group">
                                                                <Edit3 className="mr-3 h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" /> Edit Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleFullAnalysis(inquiry)} className="rounded-xl py-2.5 cursor-pointer font-bold group">
                                                                <FileSearch className="mr-3 h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" /> Full Analysis
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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

            {/* Analysis & History Dialog */}
            <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-2">
                            <FileSearch className="h-6 w-6 text-blue-600" /> Inquiry Analysis
                        </DialogTitle>
                        <DialogDescription>Detailed view and audit trail for INQ-{selectedInquiryForAnalysis?.id?.toString().padStart(4, '0')}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 mt-4">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <div>
                                <Label className="text-[10px] font-black uppercase text-slate-400">Customer</Label>
                                <p className="font-bold text-slate-900 dark:text-slate-100">{selectedInquiryForAnalysis?.customerName}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-black uppercase text-slate-400">Contact</Label>
                                <p className="font-bold text-slate-900 dark:text-slate-100">{selectedInquiryForAnalysis?.contactPerson}</p>
                            </div>
                            <div className="md:col-span-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Requirements</Label>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{selectedInquiryForAnalysis?.description}</p>
                            </div>
                        </div>

                        {/* History Timeline */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase text-slate-400 flex items-center gap-2">
                                <Activity className="h-4 w-4" /> Activity Log (Audit Trail)
                            </h3>
                            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                                {inquiryLogs.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic pl-8">No activity logs found for this inquiry.</p>
                                ) : (
                                    inquiryLogs.map((log, idx) => (
                                        <div key={log.id} className="relative pl-8 animate-in fade-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 shadow-sm" />
                                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <div className="flex justify-between items-start mb-1">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none font-bold">{log.action}</Badge>
                                                    <span className="text-[10px] font-bold text-slate-400">{format(new Date(log.timestamp), "dd MMM, hh:mm a")}</span>
                                                </div>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{log.details}</p>
                                                <p className="text-[10px] font-black uppercase text-slate-400 mt-2">Modified By: <span className="text-blue-600">{log.modifiedBy}</span></p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </PageWrapper>
    );
}
