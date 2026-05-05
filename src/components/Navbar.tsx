"use client";

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

export function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all storage mechanisms to securely log out
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; // Clear cookie
    
    // Redirect to login page
    router.push("/login");
  };

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
        <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none group-hover:text-blue-600 transition-colors">PolyTrack Admin</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">System Manager</p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-white shadow-md transition-transform group-hover:scale-105 active:scale-95 duration-300">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold">PA</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl mt-2 shadow-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            <DropdownMenuLabel className="font-black text-slate-900 dark:text-slate-100 border-b dark:border-slate-800 pb-2 mb-2">My Account</DropdownMenuLabel>
            <DropdownMenuItem className="rounded-xl py-3 font-bold group">
              <User className="mr-3 h-4 w-4 text-slate-400 group-hover:text-blue-600" /> Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl py-3 font-bold group">
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
