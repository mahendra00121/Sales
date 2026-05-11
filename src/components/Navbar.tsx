"use client";

import { useState, useEffect } from "react";
import { LogOut, User, Bell, Settings, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VoiceAssistant } from "./VoiceAssistant";
import { fetchWithAuth } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Navbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ fullName: string; username: string; role: string } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const [nRes, cRes] = await Promise.all([
        fetchWithAuth("/Notification"),
        fetchWithAuth("/Notification/unread-count")
      ]);
      if (nRes.ok) setNotifications(await nRes.json());
      if (cRes.ok) setUnreadCount(await cRes.json());
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const res = await fetchWithAuth("/User/online");
      if (res.ok) setOnlineUsers(await res.json());
    } catch (error) {
      console.error("Failed to fetch online users:", error);
    }
  };

  const sendPing = async () => {
    try {
      await fetchWithAuth("/User/ping", { method: "POST" });
    } catch (error) {
      console.error("Ping failed:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    const fetchProfile = async () => {
      try {
        const response = await fetchWithAuth("/Auth/me");
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
    fetchNotifications();
    fetchOnlineUsers();
    sendPing();

    const nInterval = setInterval(fetchNotifications, 30000);
    const uInterval = setInterval(fetchOnlineUsers, 20000); // Check every 20s
    const pInterval = setInterval(sendPing, 30000); // Ping every 30s

    return () => {
      clearInterval(nInterval);
      clearInterval(uInterval);
      clearInterval(pInterval);
    };
  }, []);

  if (!mounted) {
    return <header className="h-20 border-b bg-white dark:bg-background flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm" />;
  }

  const markAllAsRead = async () => {
    await fetchWithAuth("/Notification/mark-as-read", { method: "POST" });
    setUnreadCount(0);
    fetchNotifications();
  };

  const markSingleAsRead = async (id: number) => {
    await fetchWithAuth(`/Notification/mark-as-read/${id}`, { method: "POST" });
    fetchNotifications();
  };

  const handleLogout = () => {
    // Clear all storage mechanisms to securely log out
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; // Clear cookie
    
    // Redirect to login page
    router.push("/login");
  };

  const displayName = profile?.fullName || profile?.username || "Loading...";
  const displayRole = profile?.role || "System User";
  const initials = profile?.fullName 
    ? profile.fullName.split(" ").map(n => n[0]).join("").toUpperCase()
    : profile?.username?.substring(0, 2).toUpperCase() || "??";

  return (
    <header className="h-20 border-b bg-white dark:bg-background flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/70 dark:bg-background/70">
      {/* Search Bar - Aesthetic Touch */}
      <div className="flex-1 max-w-xl hidden sm:flex items-center gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inquiries, orders..."
              className="pl-10 h-11 bg-slate-50 border-none dark:bg-slate-900 focus-visible:ring-blue-500 rounded-xl"
            />
          </div>
        </div>

      {/* Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
        {/* Online Users Indicator */}
        {onlineUsers.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-2 sm:px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800 cursor-help shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="hidden sm:inline text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">{onlineUsers.length} Online</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="p-3 rounded-2xl shadow-2xl border-none bg-white dark:bg-slate-900">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Teammates Online</p>
                <div className="space-y-2">
                  {onlineUsers.map(u => (
                    <div key={u.username} className="flex items-center gap-2">
                       <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {u.fullName?.split(' ').map((n: any) => n[0]).join('')}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">{u.fullName}</span>
                          <span className="text-[9px] font-bold text-slate-400">{u.role}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <VoiceAssistant />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer group">
              <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-5 w-5 bg-blue-600 text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl mt-2 shadow-2xl border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
              <h3 className="text-white font-black">Notifications</h3>
              <button onClick={markAllAsRead} className="text-[10px] uppercase font-black text-blue-100 hover:text-white transition-colors">Mark all read</button>
            </div>
            <div className="max-h-[350px] overflow-y-auto bg-white dark:bg-slate-950">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">No new notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={cn("p-4 border-b dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group relative", !n.isRead && "bg-blue-50/50 dark:bg-blue-900/10")}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={cn(
                            "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                            n.type === "System" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        )}>
                            {n.type || "Inquiry"}
                        </span>
                        {!n.isRead && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); markSingleAsRead(n.id); }} 
                                className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:text-white"
                                title="Mark as read"
                            >
                                <Check className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium italic">
                      {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : "Unknown time"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none group-hover:text-blue-600 transition-colors">{displayName}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{displayRole}</p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-white shadow-md transition-transform group-hover:scale-105 active:scale-95 duration-300">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl mt-2 shadow-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            <DropdownMenuLabel className="font-black text-slate-900 dark:text-slate-100 border-b dark:border-slate-800 pb-2 mb-2">My Account</DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={() => router.push("/profile")}
              className="rounded-xl py-3 font-bold group cursor-pointer"
            >
              <User className="mr-3 h-4 w-4 text-slate-400 group-hover:text-blue-600" /> Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push("/system-settings")}
              className="rounded-xl py-3 font-bold group cursor-pointer"
            >
              <Settings className="mr-3 h-4 w-4 text-slate-400 group-hover:text-blue-600" /> System Params
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="rounded-xl py-3 font-black text-blue-600 hover:bg-blue-50 cursor-pointer group"
            >
              <LogOut className="mr-3 h-4 w-4 text-blue-400 group-hover:text-blue-600" /> Logout Securely
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
