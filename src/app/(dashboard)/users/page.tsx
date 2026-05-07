"use client";

import { useState, useEffect } from "react";
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
    Briefcase,
    HardHat,
    CheckCircle2,
    Lock,
    Mail
} from "lucide-react";
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

type User = {
    id: number;
    username: string;
    fullName: string;
    role: string;
    createdAt: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    // Form States
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("User");
    const [permissions, setPermissions] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isSavingPerms, setIsSavingPerms] = useState(false);
    const [isSavingTemplates, setIsSavingTemplates] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);

    const [mounted, setMounted] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { username, fullName, password, role, id: editingUser?.id || 0 };
        const method = editingUser ? "PUT" : "POST";
        const url = editingUser ? `/User/${editingUser.id}` : "/User";

        try {
            const res = await fetchWithAuth(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(editingUser ? "User updated!" : "User created!");
                setIsModalOpen(false);
                resetForm();
                fetchUsers();
            } else {
                const err = await res.text();
                alert(err || "Operation failed");
            }
        } catch (error) {
            console.error("User op error:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetchWithAuth(`/User/${id}`, { method: "DELETE" });
            if (res.ok) fetchUsers();
            else alert(await res.text());
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const resetForm = () => {
        setEditingUser(null);
        setUsername("");
        setFullName("");
        setPassword("");
        setRole("User");
    };

    const openEdit = (u: User) => {
        setEditingUser(u);
        setUsername(u.username);
        setFullName(u.fullName);
        setRole(u.role);
        setIsModalOpen(true);
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
            if (res.ok) alert("Permissions saved! Refresh page to see changes.");
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
                alert("Template updated!");
                setEditingTemplate(null);
                fetchUsers();
            }
        } catch (error) {
            console.error("Save template error:", error);
        } finally {
            setIsSavingTemplates(false);
        }
    };

    if (isLoading || !mounted) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;

    return (
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
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl h-auto mb-8">
                    <TabsTrigger value="users" className="rounded-xl py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm font-bold">
                        <UsersIcon className="h-4 w-4 mr-2" /> User Accounts
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="rounded-xl py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm font-bold">
                        <Lock className="h-4 w-4 mr-2" /> Role Permissions
                    </TabsTrigger>
                    <TabsTrigger value="emails" className="rounded-xl py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm font-bold">
                        <Mail className="h-4 w-4 mr-2" /> Email Templates
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-8">
                    <div className="flex justify-end">
                        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 font-bold rounded-xl h-12 px-6 shadow-lg shadow-blue-100 dark:shadow-none">
                                    <UserPlus className="mr-2 h-5 w-5" /> Add New User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-3xl sm:max-w-[400px]">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black">{editingUser ? "Edit User" : "Create Account"}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400 px-1">Username</label>
                                            <Input value={username} onChange={e => setUsername(e.target.value)} disabled={!!editingUser} placeholder="e.g. john_doe" className="h-12 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400 px-1">Full Name</label>
                                            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. John Doe" className="h-12 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400 px-1">{editingUser ? "New Password (optional)" : "Password"}</label>
                                            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="******" className="h-12 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400 px-1">System Role</label>
                                            <Select value={role} onValueChange={setRole}>
                                                <SelectTrigger className="h-12 rounded-xl">
                                                    <SelectValue placeholder="Select Role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Admin">Admin (Full Access)</SelectItem>
                                                    <SelectItem value="Sales">Sales (Inquiry Only)</SelectItem>
                                                    <SelectItem value="Production">Production (Jobs Only)</SelectItem>
                                                    <SelectItem value="User">Regular User</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-black rounded-xl">
                                            {editingUser ? "Update Account" : "Create Account"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map(user => (
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
                                        <CardDescription className="font-bold flex items-center gap-1">
                                            @{user.username}
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
                                        <Button variant="secondary" onClick={() => openEdit(user)} className="flex-1 rounded-xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100">
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
                    <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900/50">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black">Role Visibility Matrix</CardTitle>
                                <CardDescription>Configure which modules each role can access in the sidebar.</CardDescription>
                            </div>
                            <Button 
                                onClick={savePermissions} 
                                disabled={isSavingPerms}
                                className="bg-blue-600 hover:bg-blue-700 font-black rounded-xl h-12 px-8"
                            >
                                {isSavingPerms ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                Save Visibility Settings
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                            <TableHead className="w-[200px] font-black uppercase text-[10px] tracking-widest text-slate-400">Module Group</TableHead>
                                            {roles.map(r => (
                                                <TableHead key={r} className="text-center font-black uppercase text-[10px] tracking-widest text-slate-400">
                                                    {r}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {modules.map(module => (
                                            <TableRow key={module} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <TableCell className="font-bold text-slate-700 dark:text-slate-300">
                                                    {module}
                                                </TableCell>
                                                {roles.map(role => {
                                                    const isVisible = permissions.find(p => p.roleName === role && p.moduleName === module)?.isVisible;
                                                    return (
                                                        <TableCell key={role} className="text-center">
                                                            <div className="flex justify-center">
                                                                <Switch 
                                                                    checked={isVisible} 
                                                                    onCheckedChange={() => togglePermission(role, module)}
                                                                    disabled={role === 'Admin' && module === 'Configuration'} // Don't lock admin out of config
                                                                    className="data-[state=checked]:bg-blue-600"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
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
    );
}
