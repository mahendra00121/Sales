"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const VoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            setIsSupported(false);
        }
    }, []);

    const handleCommand = useCallback((command: string) => {
        const cmd = command.toLowerCase().trim();
        
        // Show what was heard in a toast for better feedback
        toast.info(`Heard: "${command}"`, { 
            icon: "🎙️",
            className: "rounded-2xl font-bold bg-white dark:bg-slate-900 border-none shadow-2xl"
        });

        // Navigation Commands (English & Hindi/Hinglish)
        if (cmd.includes("sales") || cmd.includes("inquiry") || cmd.includes("bech") || cmd.includes("sell") || cmd.includes("lead")) {
            router.push("/sales-inquiry");
            toast.success("Opening Sales Inquiries");
        } 
        else if (cmd.includes("user") || cmd.includes("account") || cmd.includes("log") || cmd.includes("aadmi") || cmd.includes("permission") || cmd.includes("employee")) {
            router.push("/users");
            toast.success("Opening User Management");
        } 
        else if (cmd.includes("dashboard") || cmd.includes("home") || cmd.includes("shuru") || cmd.includes("main") || cmd.includes("overview")) {
            router.push("/dashboard");
            toast.success("Going to Dashboard");
        } 
        else if (cmd.includes("master") || cmd.includes("setting") || cmd.includes("data") || cmd.includes("config") || cmd.includes("product")) {
            router.push("/master-data");
            toast.success("Opening Configuration");
        } 
        else if (cmd.includes("feasibility") || cmd.includes("check") || cmd.includes("approve") || cmd.includes("technical")) {
            router.push("/feasibility");
            toast.success("Opening Feasibility Review");
        }
        else if (cmd.includes("costing") || cmd.includes("price") || cmd.includes("quote") || cmd.includes("paisa") || cmd.includes("estimate")) {
            router.push("/costing");
            toast.success("Opening Costing & Quote");
        }
        else if (cmd.includes("order") || cmd.includes("sales order") || cmd.includes("booking")) {
            router.push("/sales-order");
            toast.success("Opening Sales Orders");
        }
        else if (cmd.includes("planning") || cmd.includes("schedule") || cmd.includes("kab banega") || cmd.includes("calendar")) {
            router.push("/planning");
            toast.success("Opening Production Planning");
        }
        else if (cmd.includes("procurement") || cmd.includes("purchase") || cmd.includes("khareed") || cmd.includes("material")) {
            router.push("/procurement");
            toast.success("Opening Procurement & QC");
        }
        else if (cmd.includes("production") || cmd.includes("shop floor") || cmd.includes("machine") || cmd.includes("making")) {
            router.push("/production");
            toast.success("Opening Shop Floor");
        }
        else if (cmd.includes("qc") || cmd.includes("quality") || cmd.includes("final") || cmd.includes("check order")) {
            router.push("/final-qc");
            toast.success("Opening Final QC");
        }
        else if (cmd.includes("packing") || cmd.includes("box") || cmd.includes("package")) {
            router.push("/packing");
            toast.success("Opening Packing Station");
        }
        else if (cmd.includes("dispatch") || cmd.includes("delivery") || cmd.includes("ship") || cmd.includes("bhejna") || cmd.includes("truck")) {
            router.push("/dispatch");
            toast.success("Opening Dispatch");
        }
        else if (cmd.includes("waste") || cmd.includes("recycle") || cmd.includes("kachra") || cmd.includes("scrap")) {
            router.push("/waste");
            toast.success("Opening Waste Handling");
        }
        else if (cmd.includes("profile") || cmd.includes("me") || cmd.includes("my")) {
            router.push("/profile");
            toast.success("Opening Profile");
        }
        else if (cmd.includes("logout") || cmd.includes("exit") || cmd.includes("band") || cmd.includes("bahar") || cmd.includes("log out")) {
            localStorage.clear();
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            router.push("/login");
            toast.success("Logging you out...");
        } 
        else if (cmd.includes("dark") || cmd.includes("night") || cmd.includes("andhera") || cmd.includes("kala") || cmd.includes("black")) {
            document.documentElement.classList.add("dark");
            toast.success("Dark Mode On");
        } 
        else if (cmd.includes("light") || cmd.includes("day") || cmd.includes("ujala") || cmd.includes("safed") || cmd.includes("white")) {
            document.documentElement.classList.remove("dark");
            toast.success("Light Mode On");
        } 
        else {
            toast.error("Command not understood", {
                description: `Try: 'Go to Sales', 'Production', or 'Waste Handling'. Heard: ${command}`
            });
        }
    }, [router]);

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition || isListening) return;

        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN"; // Better for Indian accents
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            toast.info("Listening for command...", { duration: 2000 });
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            handleCommand(transcript);
        };

        recognition.onerror = (event: any) => {
            // Ignore 'aborted' error as it happens during normal stop/start cycles
            if (event.error === "aborted") return;
            
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            if (event.error === "not-allowed") {
                toast.error("Microphone access denied.");
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    if (!isSupported) return null;

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={startListening}
            className={cn(
                "rounded-full h-10 w-10 transition-all duration-300",
                isListening 
                    ? "bg-rose-500 text-white animate-pulse border-rose-500 hover:bg-rose-600" 
                    : "bg-slate-100 dark:bg-slate-900 border-transparent hover:bg-blue-50 hover:text-blue-600"
            )}
            title="Voice Assistant"
        >
            {isListening ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
        </Button>
    );
};
