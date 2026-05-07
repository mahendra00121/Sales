"use client";

import { useState, useEffect } from "react";
import { LogOut, User, Bell, Settings, Search } from "lucide-react";
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
import { fetchWithAuth } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function Navbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ fullName: string; username: string; role: string } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
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
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    await fetchWithAuth("/Notification/mark-as-read", { method: "POST" });
    setUnreadCount(0);
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
      <div className="hidden md:flex items-center gap-3 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-2xl w-96 border border-transparent focus-within:border-blue-200 dark:focus-within:border-blue-800 transition-all">
        <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input 
            type="text" 
            placeholder="Search operational data..." 
            className="bg-transparent border-none focus:outline-none text-sm font-medium text-slate-600 dark:text-slate-300 w-full"
        />
      </div>

      {/* Notifications & Profile */}
      <div className="flex items-center gap-6">
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
                  <div key={n.id} className={cn("p-4 border-b dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer", !n.isRead && "bg-blue-50/50 dark:bg-blue-900/10")}>
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
