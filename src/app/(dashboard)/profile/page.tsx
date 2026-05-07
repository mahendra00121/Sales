"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, User, Mail, Shield, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type UserProfile = {
  id: number;
  username: string;
  fullName: string;
  role: string;
  createdAt: string;
};

const profileSchema = z.object({
    fullName: z.string().min(2, "Name is too short"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        fullName: "",
        password: "",
    }
  });

  const fetchProfile = async () => {
    try {
      const response = await fetchWithAuth("/Auth/me");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        form.setValue("fullName", data.fullName || "");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onUpdateProfile = async (values: ProfileFormValues) => {
    setIsUpdating(true);
    try {
        const response = await fetchWithAuth("/Auth/update-profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        });

        if (response.ok) {
            alert("Profile updated successfully!");
            setIsModalOpen(false);
            fetchProfile();
        } else {
            alert("Failed to update profile");
        }
    } catch (error) {
        console.error("Update Error:", error);
        alert("An error occurred during update");
    } finally {
        setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Failed to load profile.</h2>
        <p className="text-muted-foreground">Please try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account information and preferences.</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none font-bold rounded-xl px-6 h-12">
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Edit Profile</DialogTitle>
                    <DialogDescription>Update your personal details or change your password here.</DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onUpdateProfile)} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</Label>
                            <Input 
                                {...form.register("fullName")}
                                className="h-12 rounded-xl border-slate-200 focus:border-blue-600 focus:ring-blue-600 transition-all"
                                placeholder="Enter your full name"
                            />
                            {form.formState.errors.fullName && (
                                <p className="text-rose-500 text-xs px-1">{form.formState.errors.fullName.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">New Password</Label>
                            <Input 
                                type="password"
                                {...form.register("password")}
                                className="h-12 rounded-xl border-slate-200 focus:border-blue-600 focus:ring-blue-600 transition-all"
                                placeholder="Leave blank to keep current"
                            />
                            {form.formState.errors.password && (
                                <p className="text-rose-500 text-xs px-1">{form.formState.errors.password.message}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            type="submit" 
                            disabled={isUpdating}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-lg"
                        >
                            {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side - Avatar Card */}
        <Card className="md:col-span-1 overflow-hidden border-none shadow-xl bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
          <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-800 shadow-2xl mb-6">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-4xl font-black">
                {profile.fullName?.substring(0, 2).toUpperCase() || profile.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{profile.fullName || profile.username}</h2>
            <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none font-black uppercase tracking-widest text-[10px]">
              {profile.role}
            </Badge>
            
            <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-800 my-8"></div>
            
            <div className="space-y-4 w-full">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="truncate">{profile.username}@indas.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>Headquarters, India</span>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Details Card */}
        <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-xl bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" /> Personal Information
                    </CardTitle>
                    <CardDescription>Your basic account details are listed here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Full Name</Label>
                            <p className="text-slate-800 dark:text-slate-100 font-bold">{profile.fullName || "Not Specified"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Username</Label>
                            <p className="text-slate-800 dark:text-slate-100 font-bold">@{profile.username}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Designation</Label>
                            <p className="text-slate-800 dark:text-slate-100 font-bold">{profile.role === "Admin" ? "System Administrator" : "Operation Executive"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Account Status</Label>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                <p className="text-slate-800 dark:text-slate-100 font-bold">Active</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" /> System Permissions
                    </CardTitle>
                    <CardDescription>Security and access settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px] uppercase font-black tracking-widest">System Role</Label>
                            <p className="text-slate-800 dark:text-slate-100 font-bold">{profile.role}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Member Since</Label>
                            <p className="text-slate-800 dark:text-slate-100 font-bold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {format(new Date(profile.createdAt), "dd MMM yyyy")}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={cn("block", className)}>{children}</span>;
}
