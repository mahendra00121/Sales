"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  Users,
  CreditCard,
  Activity,
  ArrowUpRight,
  Plus,
  ShoppingCart,
  FileText,
  Truck,
  Package,
  Loader2,
  CheckCircle2,
  History
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { fetchWithAuth } from "@/lib/api";

// --- Formatter ---
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeInquiries: 0,
    runningOrders: 0,
    productionYield: 98.5
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [machineStatus, setMachineStatus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 1. Fetch Inquiries
      const inquiryRes = await fetchWithAuth("/SalesInquiry");
      const inqs = await inquiryRes.json();
      
      // 2. Fetch Sales Orders (Revenue)
      const soRes = await fetchWithAuth("/SalesOrder");
      const orders = await soRes.json();
      const revenue = orders.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);

      // 3. Fetch Production Plans
      const prodRes = await fetchWithAuth("/ProductionPlan");
      const plans = await prodRes.json();
      const activePlans = plans.filter((p: any) => p.status === "In-Progress" || p.status === "Scheduled");

      setStats({
        totalRevenue: revenue,
        activeInquiries: inqs.length,
        runningOrders: activePlans.length,
        productionYield: 98.5 // Mock for now
      });

      setRecentOrders(orders.slice(-5).reverse());
      setMachineStatus(activePlans.slice(0, 3));
      
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 border-l-8 border-l-blue-600 pl-6">
            PolyTrack Control Center
          </h1>
          <p className="text-muted-foreground mt-1 ml-6 font-medium">
            Global operational overview of Thermoforming & Extrusion lines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sales-inquiry">
            <Button className="bg-blue-600 hover:bg-blue-700 font-bold py-6 px-8 rounded-2xl shadow-xl shadow-blue-100 dark:shadow-blue-900/20">
              <Plus className="mr-2 h-5 w-5" /> Register New Inquiry
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-background shadow-lg border-none rounded-3xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
           <div className="h-2 bg-blue-600" />
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase text-slate-400">Total Revenue</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600"><CreditCard className="h-5 w-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{formatter.format(stats.totalRevenue)}</div>
            <p className="text-[10px] font-bold text-blue-600 flex items-center mt-2 bg-blue-50 w-fit px-2 py-0.5 rounded-full">
              <ArrowUpRight className="mr-1 h-3 w-3" /> +12.5% vs Last Month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background shadow-lg border-none rounded-3xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
           <div className="h-2 bg-blue-600" />
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase text-slate-400">Active Pipeline</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600"><FileText className="h-5 w-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.activeInquiries} <span className="text-sm text-slate-400 font-medium">Units</span></div>
            <p className="text-[10px] font-bold text-blue-600 flex items-center mt-2">
              <Activity className="mr-1 h-3 w-3" /> Real-time Lead tracking
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background shadow-lg border-none rounded-3xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
           <div className="h-2 bg-blue-600" />
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase text-slate-400">Active Jobs</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600"><Activity className="h-5 w-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.runningOrders} <span className="text-sm text-slate-400 font-medium">Machines</span></div>
            <p className="text-[10px] font-bold text-blue-600 flex items-center mt-2">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Live Shop Floor Status
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background shadow-lg border-none rounded-3xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
           <div className="h-2 bg-blue-600" />
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase text-slate-400">Production Yield</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600"><CheckCircle2 className="h-5 w-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.productionYield}%</div>
            <p className="text-[10px] font-bold text-blue-600 flex items-center mt-2 bg-blue-50 dark:bg-blue-900/20 w-fit px-2 py-0.5 rounded-full">
              OPTIMIZED
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Recent Orders List */}
        <Card className="col-span-4 shadow-xl border-none rounded-3xl bg-slate-50 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5 text-blue-600" /> Recent Sales Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-center py-10 text-slate-400">No recent orders found.</p>
              ) : (
                recentOrders.map((order, i) => (
                  <div key={i} className="flex items-center p-3 bg-background rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <Avatar className="h-10 w-10 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                      <AvatarFallback>{order.inquiry?.customerName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200">{order.inquiry?.customerName}</p>
                      <p className="text-[10px] font-bold text-slate-400">Order ID: {order.orderNumber || `SO-${order.id}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-blue-600">{formatter.format(order.totalAmount)}</p>
                      <Badge className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-none">CONFIRMED</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Shop Floor Activity */}
        <Card className="col-span-3 shadow-xl border border-slate-200 dark:border-none rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5 dark:opacity-10 text-blue-600 dark:text-white"><Activity className="h-40 w-40" /></div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold"><Activity className="h-5 w-5" /> Active Production Lines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {machineStatus.length === 0 ? (
              <p className="text-center py-10 text-slate-500 italic">No machines running currently.</p>
            ) : (
              machineStatus.map((m, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{m.machineName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{m.order?.inquiry?.description}</p>
                    </div>
                    <Badge className="bg-blue-600 animate-pulse border-none text-white">RUNNING</Badge>
                  </div>
                  <div className="space-y-1">
                     <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                       <span>Progress</span>
                       <span>{Math.round((m.completedQuantity / m.targetQuantity) * 100)}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-1000" 
                          style={{ width: `${(m.completedQuantity / m.targetQuantity) * 100}%` }}
                        />
                     </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Sales Pipeline", sub: "1. Sales Inquiry", icon: FileText, href: "/sales-inquiry", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-800" },
          { label: "Orders Board", sub: "4. Sales Order", icon: ShoppingCart, href: "/sales-order", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-800" },
          { label: "Execution Floor", sub: "7. Shop Floor", icon: Activity, href: "/production", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-800" },
          { label: "Fleet & Dispatch", sub: "10. Dispatch", icon: Truck, href: "/dispatch", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-800" }
        ].map((action, i) => (
          <Link href={action.href} key={i}>
            <Card className={`hover:scale-[1.03] transition-all cursor-pointer border rounded-3xl shadow-sm ${action.color}`}>
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className="p-3 bg-background rounded-2xl shadow-sm">
                   <action.icon className="h-6 w-6" />
                </div>
                <div className="overflow-hidden">
                  <CardTitle className="text-sm font-black whitespace-nowrap">{action.label}</CardTitle>
                  <CardDescription className="text-[10px] font-bold opacity-70">{action.sub}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
