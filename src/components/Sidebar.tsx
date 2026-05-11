"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";
import {
    LayoutDashboard,
    FileText,
    SearchCheck,
    Calculator,
    ShoppingCart,
    CalendarClock,
    Factory,
    PackageCheck,
    Package,
    Truck,
    Recycle,
    Settings,
    BarChart3,
    Menu,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Users as UsersIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const menuGroups = [
    {
        group: "Overview",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Analytics & Reports", href: "/reports", icon: BarChart3 },
        ]
    },
    {
        group: "Pre-Sales",
        items: [
            { label: "1. Sales Inquiry", href: "/sales-inquiry", icon: FileText },
            { label: "2. Feasibility Review", href: "/feasibility", icon: SearchCheck },
            { label: "3. Costing & Quote", href: "/costing", icon: Calculator },
            { label: "4. Sales Order", href: "/sales-order", icon: ShoppingCart },
        ]
    },
    {
        group: "Production",
        items: [
            { label: "5. Production Plan", href: "/planning", icon: CalendarClock },
            { label: "6. Procurement & QC", href: "/procurement", icon: Factory },
            { label: "7. Shop Floor", href: "/production", icon: Settings },
        ]
    },
    {
        group: "Logistics",
        items: [
            { label: "8. Final QC", href: "/final-qc", icon: PackageCheck },
            { label: "9. Packing", href: "/packing", icon: Package },
            { label: "10. Dispatch", href: "/dispatch", icon: Truck },
        ]
    },
    {
        group: "Sustainability",
        items: [
            { label: "Waste Handling", href: "/waste", icon: Recycle },
        ]
    },
    {
        group: "Configuration",
        items: [
            { label: "Master Data", href: "/master-data", icon: Settings },
        ]
    }
];

interface NavContentProps extends React.HTMLAttributes<HTMLDivElement> {
    collapsed?: boolean;
}

export function Sidebar() {
    const [open, setOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    
    const [mounted, setMounted] = useState(false);
    const [userRole, setUserRole] = useState("User");
    const [userName, setUserName] = useState("System User");
    const [rolePermissions, setRolePermissions] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        const userStr = localStorage.getItem("user");
        const userData = userStr ? JSON.parse(userStr) : null;
        if (userData?.user) {
            setUserRole(userData.user.role || "User");
            setUserName(userData.user.fullName || userData.user.username || "System User");
        }

        // Fetch Dynamic Permissions
        const fetchPermissions = async () => {
            try {
                const res = await fetchWithAuth("/RolePermission");
                if (res.ok) setRolePermissions(await res.json());
            } catch (error) {
                console.error("Failed to fetch permissions:", error);
            }
        };
        fetchPermissions();
    }, []);

    const filteredMenuGroups = mounted ? menuGroups.map(group => {
        // Find permission for this role and module
        const perm = rolePermissions.find(p => p.roleName === userRole && p.moduleName === group.group);
        
        // If permission exists, follow its visibility
        if (perm) {
            return perm.isVisible ? { ...group, items: [...group.items] } : null;
        }

        // Fallback/Default if no record found (Admin sees everything by default)
        if (userRole === "Admin") return { ...group, items: [...group.items] };

        // Simple default fallback
        if (group.group === "Overview") return { ...group, items: [...group.items] };
        
        return null;
    }).filter(Boolean) as typeof menuGroups : [];

    // Add User Management for Admin in Configuration group
    if (mounted && userRole === "Admin") {
        const configGroup = filteredMenuGroups.find(g => g.group === "Configuration");
        if (configGroup && !configGroup.items.find(i => i.href === "/users")) {
            configGroup.items.push({ label: "User Management", href: "/users", icon: UsersIcon });
        }
    }

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/login");
    };

    const NavContent = ({ className, collapsed = false }: NavContentProps) => (
        <div className={cn("flex flex-col h-full py-4", className)}>
            <div className={cn("px-6 mb-6 flex items-center gap-2 font-bold text-xl transition-all", collapsed ? "justify-center px-2" : "")}>
                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                    <Factory className="h-6 w-6" />
                </div>
                {!collapsed && (
                    <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent truncate">
                        PolyTrack
                    </span>
                )}
            </div>

            <div className="flex-1 px-4 overflow-y-auto no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <div className="space-y-6">
                    {filteredMenuGroups.map((group, index) => (
                        <div key={index} className="py-2">
                            {!collapsed && (
                                <h4 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground uppercase opacity-70 truncate">
                                    {group.group}
                                </h4>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <TooltipProvider delayDuration={0} key={item.href}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link href={item.href} onClick={() => setOpen(false)} className="block w-full">
                                                    <Button
                                                        variant={pathname === item.href ? "secondary" : "ghost"}
                                                        className={cn(
                                                            "w-full transition-all duration-200",
                                                            pathname === item.href ? "bg-secondary font-medium" : "hover:bg-transparent hover:underline",
                                                            collapsed ? "justify-center px-2" : "justify-start"
                                                        )}
                                                    >
                                                        <item.icon className={cn("h-4 w-4", collapsed ? "" : "mr-3", pathname === item.href ? "text-primary" : "text-muted-foreground")} />
                                                        {!collapsed && <span className="truncate">{item.label}</span>}
                                                    </Button>
                                                </Link>
                                            </TooltipTrigger>
                                            {collapsed && (
                                                <TooltipContent side="right" sideOffset={15} className="font-bold text-sm bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xl border-none">
                                                    {item.label}
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={cn("mt-auto border-t pt-4 px-4 pb-4", collapsed ? "flex justify-center" : "")}>
                <div className={cn("flex items-center", collapsed ? "flex-col gap-4" : "justify-between gap-2")}>
                    {!collapsed && (
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Avatar className="h-9 w-9 shrink-0 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                                    {userName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-sm truncate">
                                <p className="font-black leading-none text-slate-800 dark:text-slate-100">{userName}</p>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter mt-1">{userRole}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <ModeToggle />
                    </div>
                </div>
            </div>
        </div>
    );

    if (!mounted) {
        return <div className={cn("hidden md:block border-r bg-card h-full flex-shrink-0", collapsed ? "w-16" : "w-64")} />;
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className={cn(
                    "hidden border-r bg-card md:block h-full flex-shrink-0 transition-all duration-300 relative",
                    collapsed ? "w-16" : "w-64"
                )}
            >
                {/* Collapsed Toggle Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-muted"
                >
                    {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </Button>

                <NavContent collapsed={collapsed} />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden flex h-16 items-center px-4 border-b bg-card flex-shrink-0 w-full gap-3">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="-ml-2">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85%] sm:w-[350px] p-0">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <NavContent />
                    </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2 font-bold text-lg">
                    <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                        <Factory className="h-5 w-5" />
                    </div>
                    <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        PolyTrack
                    </span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <ModeToggle />
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Logout</span>
                    </Button>
                </div>
            </div>
        </>
    );
}
