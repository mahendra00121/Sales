"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Loader2, Eye, EyeOff, Boxes } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BASE_URL } from "@/lib/api";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          password: data.password
        }),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem("user", JSON.stringify(result)); // Store user info
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Invalid login credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Backend server is not responding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-[#fdfdfd] p-4 md:p-0">
      {/* Subtle Background Radial Gradient */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(38,152,150,0.03)_0%,transparent_70%]" />
      
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Logo & Text */}
        <div className="flex flex-col items-center md:items-start space-y-1 animate-in fade-in slide-in-from-left-4 duration-700">
           <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-teal-600/10 text-teal-600">
               <Boxes className="w-8 h-8" />
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-bold tracking-tight text-[#0f3c3b] leading-none">INDAS</span>
              <span className="text-3xl font-semibold tracking-wide text-black leading-none mt-1">ANALYTICS</span>
            </div>
          </div>
          <p className="text-sm md:text-base font-medium text-gray-500 tracking-wider">
            Print Process Automation Partner
          </p>
        </div>

        {/* Right Side: Login Card */}
        <div className="flex justify-center md:justify-end animate-in fade-in slide-in-from-right-4 duration-700">
          <Card className="w-full max-w-[420px] border-none shadow-[0_20px_50px_rgba(38,152,150,0.12)] rounded-[32px] bg-white p-6 md:p-8">
            <CardHeader className="space-y-2 pb-8 pt-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-teal-600/10 flex items-center justify-center">
                    <Boxes className="w-5 h-5 text-teal-600" />
                  </div>
                  <CardTitle className="text-4xl font-bold text-[#269896] text-center">Welcome PolyTrack ERP</CardTitle>
                </div>
                <CardDescription className="text-gray-500 text-sm font-medium">
                  Please enter your Login Details
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="px-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Username" 
                              {...field} 
                              className="h-12 bg-[#eff1f4] border-none text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-600/20 rounded-xl px-4"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Password" 
                              {...field} 
                              className="h-12 bg-[#eff1f4] border-none text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-600/20 rounded-xl px-4"
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 bg-[#269896] hover:bg-[#1e7a78] text-white font-bold text-lg transition-all duration-300 rounded-xl shadow-lg shadow-teal-600/25 mt-4"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            
            <CardFooter className="pt-8 pb-2 flex flex-col items-center">
               <p className="text-xs text-gray-400 italic">
                  Powered by INDAS Analytics
               </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
