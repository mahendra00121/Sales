"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
    Loader2, 
    UserPlus, 
    Shield, 
    Trash2, 
    Edit, 
    Users as UsersIcon,
    ShieldCheck,
    HardHat,
    CheckCircle2,
    Lock,
    Mail,
    LayoutDashboard,
    TrendingUp,
    Factory,
    Truck,
    Leaf,
    Settings2,
    Monitor,
    Briefcase,
    Eye,
    EyeOff
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PageWrapper } from "@/components/PageWrapper";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type User = {
    id: number;
    username: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
};

// Form Schema
const userSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    role: z.string().min(1, "Role is required"),
});

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    const [permissions, setPermissions] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isSavingPerms, setIsSavingPerms] = useState(false);
    const [isSavingTemplates, setIsSavingTemplates] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);

    const [mounted, setMounted] = useState(false);

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: "",
            fullName: "",
            email: "",
            password: "",
            role: "User",
        },
    });

    const { register, handleSubmit, setValue, watch, formState: { errors }, reset: resetFormState } = form;

    const roles = ["Admin", "Sales", "Production", "User"];
    const modules = ["Overview", "Pre-Sales", "Production", "Logistics", "Sustainability", "Configuration"];

    const fetchUsers = async () => {
        try {
            const res = await fetchWithAuth("/User");
            if (res.ok) setUsers(await res.json());

            const permRes = await fetchWithAuth("/RolePermission");
            if (permRes.ok) setPermissions(await permRes.json());

            const tempRes = await fetchWithAuth("/EmailTemplate");
            if (tempRes.ok) setTemplates(await tempRes.json());
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        setMounted(true);
        fetchUsers(); 
    }, []);

    const resetForm = () => {
        setEditingUser(null);
        resetFormState({
            username: "",
            fullName: "",
            email: "",
            password: "",
            role: "User",
        });
    };

    const handleUserSubmit = async (values: z.infer<typeof userSchema>) => {
        setIsLoading(true);
        const payload = { ...values, id: editingUser?.id || 0 };
        const method = editingUser ? "PUT" : "POST";
        const url = editingUser ? `/User/${editingUser.id}` : "/Auth/register";

        try {
            const res = await fetchWithAuth(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(editingUser ? "User account updated successfully!" : "New user account created!");
                setIsModalOpen(false);
                resetForm();
                fetchUsers();
            } else {
                const err = await res.text();
                toast.error(err || "Operation failed. Please try again.");
            }
        } catch (error) {
            console.error("User op error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetchWithAuth(`/User/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("User deleted successfully.");
                fetchUsers();
            }
            else toast.error(await res.text());
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete user.");
        }
    };

    const togglePermission = (roleName: string, moduleName: string) => {
        const newPerms = [...permissions];
        const index = newPerms.findIndex(p => p.roleName === roleName && p.moduleName === moduleName);
        if (index > -1) {
            newPerms[index].isVisible = !newPerms[index].isVisible;
        } else {
            newPerms.push({ roleName, moduleName, isVisible: true });
        }
        setPermissions(newPerms);
    };

    const savePermissions = async () => {
        setIsSavingPerms(true);
        try {
            const res = await fetchWithAuth("/RolePermission/update-bulk", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(permissions)
            });
            if (res.ok) toast.success("Module visibility permissions updated!");
        } catch (error) {
            console.error("Save perms error:", error);
        } finally {
            setIsSavingPerms(false);
        }
    };

    const handleUpdateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingTemplates(true);
        try {
            const res = await fetchWithAuth(`/EmailTemplate/${editingTemplate.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingTemplate)
            });
            if (res.ok) {
                toast.success("Email template customized successfully!");
                setEditingTemplate(null);
                fetchUsers();
            }
        } catch (error) {
            console.error("Save template error:", error);
        } finally {
            setIsSavingTemplates(false);
        }
    };

    if (!mounted) return null;

    return (
        <PageWrapper>
            <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Shield className="h-8 w-8 text-blue-600" /> Access Control Center
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage users and role-based module visibility.</p>
                </div>
            </div>

            <Tabs defaultValue="users" className="w-full">
                <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl h-auto mb-4 inline-flex min-w-full md:min-w-0">
                        <TabsTrigger value="users" className="flex-1 rounded-xl py-3 px-4 md:px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm font-bold whitespace-nowrap text-sm">
                            <UsersIcon className="h-4 w-4 mr-2" /> User Accounts
                        </TabsTrigger>
                        <TabsTrigger value="permissions" className="flex-1 rounded-xl py-3 px-4 md:px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm font-bold whitespace-nowrap text-sm">
                            <Lock className="h-4 w-4 mr-2" /> Role Permissions
                        </TabsTrigger>
                        <TabsTrigger value="emails" className="flex-1 rounded-xl py-3 px-4 md:px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm font-bold whitespace-nowrap text-sm">
                            <Mail className="h-4 w-4 mr-2" /> Email Templates
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="users" className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-200">Active Directory</h2>
                        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-bold rounded-xl h-12 px-6 shadow-lg shadow-blue-100 dark:shadow-none">
                                    <UserPlus className="mr-2 h-5 w-5" /> Add New User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-[2.5rem] w-[95vw] sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl">
                                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <UsersIcon className="h-32 w-32" />
                                    </div>
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                                            <UserPlus className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-2xl font-black">{editingUser ? "Edit Profile" : "Create Account"}</DialogTitle>
                                            <p className="text-blue-100 text-xs font-bold mt-1">
                                                {editingUser ? "Update user credentials and role" : "Setup a new professional account"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit(handleUserSubmit)} className="p-8 space-y-6 bg-white dark:bg-slate-900">
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex justify-between", errors.username && "text-rose-500")}>
                                                Username
                                                {errors.username && <span className="lowercase font-bold">! {errors.username.message}</span>}
                                            </label>
                                            <div className="relative group">
                                                <UsersIcon className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-600", errors.username && "text-rose-400")} />
                                                <Input 
                                                    {...register("username")} 
                                                    disabled={!!editingUser} 
                                                    placeholder="e.g. john_doe" 
                                                    className={cn("h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-all", errors.username && "ring-2 ring-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20")} 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex justify-between", errors.fullName && "text-rose-500")}>
                                                Full Name
                                                {errors.fullName && <span className="lowercase font-bold">! {errors.fullName.message}</span>}
                                            </label>
                                            <div className="relative group">
                                                <UserPlus className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-600", errors.fullName && "text-rose-400")} />
                                                <Input 
                                                    {...register("fullName")} 
                                                    placeholder="e.g. John Doe" 
                                                    className={cn("h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-all", errors.fullName && "ring-2 ring-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20")} 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex justify-between", errors.email && "text-rose-500")}>
                                                Email Address
                                                {errors.email && <span className="lowercase font-bold">! {errors.email.message}</span>}
                                            </label>
                                            <div className="relative group">
                                                <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-600", errors.email && "text-rose-400")} />
                                                <Input 
                                                    {...register("email")} 
                                                    placeholder="e.g. john@polytrack.com" 
                                                    className={cn("h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-all", errors.email && "ring-2 ring-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20")} 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex justify-between", errors.password && "text-rose-500")}>
                                                Password {editingUser && "(Optional)"}
                                                {errors.password && <span className="lowercase font-bold">! {errors.password.message}</span>}
                                            </label>
                                            <div className="relative group">
                                                <Lock className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-600", errors.password && "text-rose-400")} />
                                                <Input 
                                                    type="password" 
                                                    {...register("password")} 
                                                    placeholder="••••••" 
                                                    className={cn("h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-all", errors.password && "ring-2 ring-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20")} 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Access Role</label>
                                            <Select value={watch("role")} onValueChange={v => setValue("role", v)}>
                                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-600 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <Shield className="h-4 w-4 text-blue-600" />
                                                        <SelectValue placeholder="Select Role" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                                    <SelectItem value="Admin" className="rounded-xl focus:bg-blue-50 focus:text-blue-600 cursor-pointer py-3">Administrator</SelectItem>
                                                    <SelectItem value="Sales" className="rounded-xl focus:bg-blue-50 focus:text-blue-600 cursor-pointer py-3">Sales Manager</SelectItem>
                                                    <SelectItem value="Production" className="rounded-xl focus:bg-blue-50 focus:text-blue-600 cursor-pointer py-3">Production Manager</SelectItem>
                                                    <SelectItem value="User" className="rounded-xl focus:bg-blue-50 focus:text-blue-600 cursor-pointer py-3">Standard User</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <DialogFooter className="pt-4">
                                        <Button type="submit" disabled={isLoading} className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none border-none transition-all hover:scale-[1.02] active:scale-95 group">
                                            {isLoading ? (
                                                <Loader2 className="animate-spin h-6 w-6" />
                                            ) : (
                                                <>
                                                    <span className="flex-1">{editingUser ? "Update Account" : "Initialize Account"}</span>
                                                    <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </div>
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="border-none shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900/50 p-6 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-14 w-14 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-12 w-full rounded-2xl" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-10 flex-1 rounded-xl" />
                                        <Skeleton className="h-10 flex-1 rounded-xl" />
                                    </div>
                                </Card>
                            ))
                        ) : users.map(user => (
                            <Card key={user.id} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden group bg-white dark:bg-slate-900/50">
                                <div className={`h-2 ${user.role === 'Admin' ? 'bg-rose-500' : 'bg-blue-600'}`} />
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <Avatar className="h-14 w-14 border-4 border-slate-50 dark:border-slate-800 shadow-md">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white font-bold text-xl">
                                            {user.fullName?.substring(0, 2).toUpperCase() || "??"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg font-black">{user.fullName}</CardTitle>
                                        <CardDescription className="font-bold flex flex-col gap-0.5">
                                            <span className="text-blue-600">@{user.username}</span>
                                            <span className="text-[11px] text-slate-500 lowercase flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {user.email || 'no-email@polytrack.com'}
                                            </span>
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                        <div className="flex items-center gap-2">
                                            {user.role === 'Admin' ? <ShieldCheck className="h-4 w-4 text-rose-500" /> : <HardHat className="h-4 w-4 text-blue-500" />}
                                            <span className="text-xs font-black uppercase tracking-wider">{user.role}</span>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] font-bold">ACTIVE</Badge>
                                    </div>

                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                                        Member Since {format(new Date(user.createdAt), "MMM yyyy")}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="secondary" onClick={() => {
                                            setEditingUser(user);
                                            resetFormState({
                                                username: user.username,
                                                fullName: user.fullName,
                                                email: user.email || "",
                                                role: user.role,
                                                password: "",
                                            });
                                            setIsModalOpen(true);
                                        }} className="flex-1 rounded-xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100">
                                            <Edit className="h-4 w-4 mr-2" /> Edit
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleDelete(user.id)} className="flex-1 rounded-xl font-bold bg-rose-50 text-rose-600 hover:bg-rose-100">
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="permissions">
                    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900/50">
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black">Visibility Matrix</CardTitle>
                                    <p className="text-slate-400 text-xs font-bold mt-1">Configure which modules are visible to each user role.</p>
                                </div>
                            </div>
                            <Button 
                                onClick={savePermissions} 
                                disabled={isSavingPerms}
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 font-black rounded-xl h-12 px-8 shadow-xl shadow-blue-500/10 border-none transition-all active:scale-95"
                            >
                                {isSavingPerms ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                Update Permissions
                            </Button>
                        </div>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                            <TableHead className="w-[300px] py-6 px-8 font-black uppercase text-[10px] tracking-widest text-slate-400">
                                                Module / Feature Group
                                            </TableHead>
                                            {roles.map(r => (
                                                <TableHead key={r} className="text-center py-6 px-4">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className={cn(
                                                            "p-2 rounded-lg",
                                                            r === 'Admin' ? "bg-rose-100 text-rose-600" : 
                                                            r === 'Sales' ? "bg-blue-100 text-blue-600" :
                                                            r === 'Production' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600"
                                                        )}>
                                                            {r === 'Admin' ? <Shield className="h-4 w-4" /> : 
                                                             r === 'Sales' ? <TrendingUp className="h-4 w-4" /> :
                                                             r === 'Production' ? <Factory className="h-4 w-4" /> : <UsersIcon className="h-4 w-4" />}
                                                        </div>
                                                        <span className="font-black uppercase text-[10px] tracking-widest">{r}</span>
                                                    </div>
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {modules.map((module, mIdx) => {
                                            const moduleIcons: Record<string, any> = {
                                                'Overview': LayoutDashboard,
                                                'Pre-Sales': Briefcase,
                                                'Production': Factory,
                                                'Logistics': Truck,
                                                'Sustainability': Leaf,
                                                'Configuration': Settings2
                                            };
                                            const Icon = moduleIcons[module] || Monitor;
                                            
                                            return (
                                                <TableRow key={module} className="border-slate-100 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                                                    <TableCell className="py-5 px-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 transition-colors">
                                                                <Icon className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-slate-700 dark:text-slate-300 block">{module}</span>
                                                                <span className="text-[10px] text-slate-400 font-medium">Control access to {module.toLowerCase()} features</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    {roles.map(role => {
                                                        const isVisible = permissions.find(p => p.roleName === role && p.moduleName === module)?.isVisible;
                                                        return (
                                                            <TableCell key={role} className="text-center">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <Switch 
                                                                        checked={isVisible} 
                                                                        onCheckedChange={() => togglePermission(role, module)}
                                                                        disabled={role === 'Admin' && module === 'Configuration'} 
                                                                        className="data-[state=checked]:bg-blue-600"
                                                                    />
                                                                    <span className={cn(
                                                                        "text-[9px] font-black uppercase tracking-tighter",
                                                                        isVisible ? "text-blue-600" : "text-slate-300"
                                                                    )}>
                                                                        {isVisible ? "Visible" : "Hidden"}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="emails">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {templates.map(temp => (
                            <Card key={temp.id} className="border-none shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900/50">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-blue-600 font-bold uppercase tracking-widest text-[10px]">
                                            {temp.name}
                                        </Badge>
                                        <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(temp)} className="text-blue-600 font-bold hover:bg-blue-50">
                                            <Edit className="h-4 w-4 mr-2" /> Customize
                                        </Button>
                                    </div>
                                    <CardTitle className="text-lg mt-3">{temp.subject}</CardTitle>
                                    <CardDescription>Automatic email notification template.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-[11px] font-mono text-slate-500 overflow-hidden line-clamp-4">
                                        {temp.body}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
                        <DialogContent className="sm:max-w-[700px] rounded-3xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Edit Email Template</DialogTitle>
                            </DialogHeader>
                            {editingTemplate && (
                                <form onSubmit={handleUpdateTemplate} className="space-y-6 py-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">Subject Line</label>
                                            <Input 
                                                value={editingTemplate.subject} 
                                                onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-black uppercase text-slate-400">HTML Content</label>
                                                <span className="text-[10px] text-blue-500 font-bold">Use {"{{OTP}}"}, {"{{CustomerName}}"} as placeholders</span>
                                            </div>
                                            <Textarea 
                                                value={editingTemplate.body} 
                                                onChange={e => setEditingTemplate({...editingTemplate, body: e.target.value})}
                                                className="min-h-[300px] rounded-2xl font-mono text-sm leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={isSavingTemplates} className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-black rounded-xl">
                                            {isSavingTemplates ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                            Save Template Changes
                                        </Button>
                                    </DialogFooter>
                                </form>
                            )}
                        </DialogContent>
                    </Dialog>
                </TabsContent>
            </Tabs>
        </div>
        </PageWrapper>
    );
}
