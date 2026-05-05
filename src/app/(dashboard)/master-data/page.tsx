"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchWithAuth } from "@/lib/api";
import {
    Plus,
    Loader2,
    Pencil,
    Trash2,
    Settings2,
    Layers,
    Box,
    Cpu,
    Wrench,
    Package
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string(),
    category: z.string(),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type MasterData = {
    id: number;
    category: string;
    name: string;
    description: string;
    isActive: boolean;
};

export default function MasterDataPage() {
    const [data, setData] = useState<MasterData[]>([]);
    const [activeTab, setActiveTab] = useState("ProductType");
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [editingItem, setEditingItem] = useState<MasterData | null>(null);
    const [mounted, setMounted] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            category: "ProductType",
            isActive: true,
        },
    });

    const fetchData = async (category: string) => {
        setIsFetching(true);
        try {
            const response = await fetchWithAuth(`/MasterData?category=${category}`);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error("Failed to fetch master data:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchData(activeTab);
    }, [activeTab]);

    if (!mounted) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setEditingItem(null);
            form.reset({
                name: "",
                description: "",
                category: activeTab,
                isActive: true,
            });
        }
    };

    const handleEdit = (item: MasterData) => {
        setEditingItem(item);
        form.reset({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            isActive: item.isActive,
        });
        setOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            const response = await fetchWithAuth(`/MasterData/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                fetchData(activeTab);
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        setIsLoading(true);
        try {
            const url = editingItem 
                ? `/MasterData/${editingItem.id}` 
                : "/MasterData";
            
            const method = editingItem ? "PUT" : "POST";

            const response = await fetchWithAuth(url, {
                method: method,
                body: JSON.stringify({
                    ...values,
                    category: activeTab
                }),
            });

            if (response.ok) {
                fetchData(activeTab);
                setOpen(false);
                setEditingItem(null);
                form.reset();
            } else {
                alert("Failed to save data");
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
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Master Data Management</h1>
                    <p className="text-muted-foreground">
                        Manage global configuration for products, materials, machines, tools, and packing.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Add New {
                                activeTab === "ProductType" ? "Product Type" : 
                                activeTab === "MaterialPreference" ? "Material" :
                                activeTab === "MachineAllocation" ? "Machine" : 
                                activeTab === "MoldTooling" ? "Tool" : "Packing Material"
                            }
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit" : "Add New"} {
                                activeTab === "ProductType" ? "Product Type" : 
                                activeTab === "MaterialPreference" ? "Material" :
                                activeTab === "MachineAllocation" ? "Machine" : 
                                activeTab === "MoldTooling" ? "Tool" : "Packing Material"
                            }</DialogTitle>
                            <DialogDescription>
                                Enter the details for the master data entry.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder={
                                        activeTab === "ProductType" ? "e.g. Food Tray" : 
                                        activeTab === "MaterialPreference" ? "e.g. PET" :
                                        activeTab === "MachineAllocation" ? "e.g. Machine 01" : 
                                        activeTab === "MoldTooling" ? "e.g. Mold A" : "e.g. Corrugated Box"
                                    }
                                    {...form.register("name")}
                                />
                                {form.formState.errors.name && (
                                    <p className="text-blue-500 text-xs">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Brief description..."
                                    {...form.register("description")}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                    {...form.register("isActive")}
                                />
                                <Label htmlFor="isActive">Is Active</Label>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingItem ? "Update" : "Save"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="ProductType" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 max-w-[1000px]">
                    <TabsTrigger value="ProductType" className="flex items-center gap-2">
                        <Box className="h-4 w-4" />
                        Product Types
                    </TabsTrigger>
                    <TabsTrigger value="MaterialPreference" className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Materials
                    </TabsTrigger>
                    <TabsTrigger value="MachineAllocation" className="flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        Machines
                    </TabsTrigger>
                    <TabsTrigger value="MoldTooling" className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Molds / Tooling
                    </TabsTrigger>
                    <TabsTrigger value="PackingMaterial" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Packing Materials
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="ProductType" className="mt-6">
                    <MasterDataTable 
                        data={data} 
                        isFetching={isFetching} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                    />
                </TabsContent>

                <TabsContent value="MaterialPreference" className="mt-6">
                    <MasterDataTable 
                        data={data} 
                        isFetching={isFetching} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                    />
                </TabsContent>

                <TabsContent value="MachineAllocation" className="mt-6">
                    <MasterDataTable 
                        data={data} 
                        isFetching={isFetching} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                    />
                </TabsContent>

                <TabsContent value="MoldTooling" className="mt-6">
                    <MasterDataTable 
                        data={data} 
                        isFetching={isFetching} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                    />
                </TabsContent>

                <TabsContent value="PackingMaterial" className="mt-6">
                    <MasterDataTable 
                        data={data} 
                        isFetching={isFetching} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function MasterDataTable({ 
    data, 
    isFetching, 
    onEdit, 
    onDelete 
}: { 
    data: MasterData[], 
    isFetching: boolean, 
    onEdit: (item: MasterData) => void,
    onDelete: (id: number) => void
}) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-blue-600" />
                    Configuration List
                </CardTitle>
                <CardDescription>
                    List of configured master data items.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isFetching ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                                        <p className="mt-2 text-muted-foreground">Loading...</p>
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No entries found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                                        <TableCell className="font-semibold">{item.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{item.description || "-"}</TableCell>
                                        <TableCell>
                                            <Badge variant={item.isActive ? "default" : "secondary"} className={cn(
                                                item.isActive ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "bg-gray-100 text-gray-800"
                                            )}>
                                                {item.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                                    <Trash2 className="h-4 w-4 text-rose-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
