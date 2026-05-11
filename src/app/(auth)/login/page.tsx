"use client";

import React, { useState, useRef } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtpDigits, setForgotOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        if (result.token) {
            document.cookie = `token=${result.token}; path=/; max-age=86400`; // Store token in cookie for middleware (1 day expiry)
        }

        // Dynamic Redirect based on Role/Permissions
        const userRole = result.user?.role;
        if (userRole === "Sales") {
            router.push("/sales-inquiry");
        } else if (userRole === "Production") {
            router.push("/production");
        } else if (userRole === "Admin") {
            router.push("/dashboard");
        } else {
            router.push("/sales-inquiry"); // Default fallback
        }
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

  const handleForgotPassword = async (isResend = false) => {
    if (!forgotEmail) {
      toast.error("Please enter your registered email.");
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      if (res.ok) {
        toast.success(isResend ? "New code sent!" : "Verification code sent to your email!");
        setForgotStep(2);
        setResendTimer(30); // 30 seconds wait
        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        const data = await res.json();
        toast.error(data.message || "Email not found.");
      }
    } catch (error) {
      toast.error("Connection error.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = forgotOtpDigits.join("");
    if (otpValue.length < 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: otpValue })
      });
      if (res.ok) {
        setForgotStep(3);
      } else {
        const data = await res.json();
        toast.error(data.message || "Invalid or expired code.");
      }
    } catch (error) {
      toast.error("Connection error.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const otpValue = forgotOtpDigits.join("");
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: forgotEmail, 
          otp: otpValue,
          newPassword: newPassword
        })
      });
      if (res.ok) {
        toast.success("Password updated! Please login.");
        setIsForgotOpen(false);
        setForgotStep(1);
        setForgotEmail("");
        setForgotOtpDigits(["", "", "", "", "", ""]);
        setNewPassword("");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to reset password.");
      }
    } catch (error) {
      toast.error("Connection error.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]; // Only take last char
    const newDigits = [...forgotOtpDigits];
    newDigits[index] = value;
    setForgotOtpDigits(newDigits);

    // Auto-focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !forgotOtpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-[#fdfdfd] p-4 md:p-0">
      {/* Subtle Background Radial Gradient */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(38,152,150,0.03)_0%,transparent_70%]" />
      
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Logo & Text */}
        <div className="flex flex-col items-center md:items-start space-y-1 fade-in">
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
        <div className="flex justify-center md:justify-end">
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
                          <div className="flex justify-end px-1">
                            <button 
                              type="button" 
                              onClick={() => setIsForgotOpen(true)}
                              className="text-[11px] font-bold text-teal-600 hover:text-teal-700 transition-colors"
                            >
                              Forgot Password?
                            </button>
                          </div>
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

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="rounded-[2.5rem] w-[95vw] max-w-[400px] border-none shadow-2xl p-8">
          <DialogHeader className="space-y-3 pb-4">
            <DialogTitle className="text-3xl font-black text-[#269896] text-center">
              {forgotStep === 1 && "Recover Account"}
              {forgotStep === 2 && "Verification"}
              {forgotStep === 3 && "New Password"}
            </DialogTitle>
            <DialogDescription className="text-center font-medium">
              {forgotStep === 1 && "Enter your registered email address to receive a recovery code."}
              {forgotStep === 2 && "We've sent a 6-digit code to your email. Enter it below."}
              {forgotStep === 3 && "Create a secure new password for your account."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {forgotStep === 1 && (
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-slate-400 px-1">Email Address</Label>
                <div className="relative">
                  <Input 
                    placeholder="example@company.com" 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="h-14 bg-slate-50 border-none rounded-2xl px-4 font-medium"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>
            )}

            {forgotStep === 2 && (
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase text-slate-400 px-1 text-center block">Verification Code</Label>
                <div className="flex justify-between gap-2 px-1">
                  {forgotOtpDigits.map((digit, i) => (
                    <Input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-2xl font-black bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:ring-0 rounded-xl transition-all"
                    />
                  ))}
                </div>
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Resend code in <span className="text-teal-600">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button 
                      onClick={() => handleForgotPassword(true)}
                      disabled={isForgotLoading}
                      className="text-[11px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-widest transition-colors"
                    >
                      Resend New Code
                    </button>
                  )}
                </div>
              </div>
            )}

            {forgotStep === 3 && (
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-slate-400 px-1">New Password</Label>
                <div className="relative">
                  <Input 
                    type="password"
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-14 bg-slate-50 border-none rounded-2xl px-4 font-medium"
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>
            )}

            <Button 
              onClick={() => {
                if (forgotStep === 1) handleForgotPassword();
                else if (forgotStep === 2) handleVerifyOtp();
                else if (forgotStep === 3) handleResetPassword();
              }}
              disabled={isForgotLoading}
              className="w-full h-14 bg-[#269896] hover:bg-[#1e7a78] text-white font-black text-lg rounded-2xl shadow-lg shadow-teal-600/20"
            >
              {isForgotLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                forgotStep === 3 ? "Reset Password" : "Continue"
              )}
            </Button>

            {forgotStep > 1 && (
              <button 
                onClick={() => setForgotStep(forgotStep - 1)}
                className="w-full text-center text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors"
              >
                ← Go Back
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
