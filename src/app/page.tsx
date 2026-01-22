"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TrendingUp,
  Users,
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ShoppingCart,
  FileText,
  Truck,
  Package,
  MoreHorizontal,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  PieChart as PieChartIcon
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const chartData = [
  { name: "Jan", total: 35 },
  { name: "Feb", total: 45 },
  { name: "Mar", total: 30 },
  { name: "Apr", total: 60 },
  { name: "May", total: 55 },
  { name: "Jun", total: 70 },
  { name: "Jul", total: 80 },
  { name: "Aug", total: 65 },
  { name: "Sep", total: 50 },
  { name: "Oct", total: 60 },
  { name: "Nov", total: 75 },
  { name: "Dec", total: 90 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1", "#a4de6c", "#d0ed57", "#83a6ed", "#8e44ad"];

export default function DashboardPage() {
  const [chartType, setChartType] = useState<"bar" | "line" | "area" | "pie">("bar");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Executive Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of business performance and production.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sales-inquiry">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Inquiry
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-600 flex items-center font-semibold">
                <ArrowUpRight className="mr-1 h-3 w-3" /> +20.1%
              </span>
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Inquiries</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-600 flex items-center font-semibold">
                <ArrowUpRight className="mr-1 h-3 w-3" /> +180.1%
              </span>
              <span className="ml-1">new leads</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Orders</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-orange-600 flex items-center font-semibold">
                4 Critical
              </span>
              <span className="ml-1">delivery due today</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-600 flex items-center font-semibold">
                <ArrowUpRight className="mr-1 h-3 w-3" /> +2.4%
              </span>
              <span className="ml-1">efficiency rate</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

        {/* Sales Overview Chart (Dynamic) */}
        <Card className="col-span-4 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Monthly revenue overview for the current year.</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setChartType("bar")}>
                  <BarChart3 className="mr-2 h-4 w-4" /> Bar Chart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("line")}>
                  <LineChartIcon className="mr-2 h-4 w-4" /> Line Chart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("area")}>
                  <AreaChartIcon className="mr-2 h-4 w-4" /> Graph Chart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("pie")}>
                  <PieChartIcon className="mr-2 h-4 w-4" /> Pie Chart
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full p-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}k`}
                    />
                    <Tooltip />
                    <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                  </BarChart>
                ) : chartType === "line" ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}k`}
                    />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="currentColor" strokeWidth={2} className="stroke-primary" dot={false} />
                  </LineChart>
                ) : chartType === "area" ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}k`}
                    />
                    <Tooltip />
                    <Area type="monotone" dataKey="total" stroke="currentColor" fill="currentColor" fillOpacity={0.2} className="stroke-primary fill-primary" />
                  </AreaChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0.01) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales / Activity */}
        <Card className="col-span-3 shadow-md">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              You made 25 sales this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                { name: "Acme Corp.", email: "SO-2024-101", amount: "+$1,999.00", status: "Shipped", avatar: "A" },
                { name: "Global Pharma", email: "SO-2024-099", amount: "+$39,200.00", status: "Pending", avatar: "G" },
                { name: "Fresh Foods", email: "SO-2024-102", amount: "+$299.00", status: "In Prod", avatar: "F" },
                { name: "Tech Pack", email: "SO-2024-095", amount: "+$99.00", status: "Delivered", avatar: "T" },
                { name: "Eco Eat", email: "SO-2024-105", amount: "+$4,500.00", status: "New", avatar: "E" },
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback>{item.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.email}</p>
                  </div>
                  <div className="ml-auto font-medium text-sm flex flex-col items-end">
                    {item.amount}
                    <Badge variant="outline" className="mt-1 text-[10px] h-5">{item.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Status Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

        {/* Live Machine Status */}
        <Card className="col-span-4 lg:col-span-4 shadow-md">
          <CardHeader>
            <CardTitle>Shop Floor Status</CardTitle>
            <CardDescription>Real-time machine performance monitoring.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Machine 1 */}
              <div className="p-3 border rounded-lg bg-green-50/50 flex flex-col items-center justify-center gap-2">
                <div className="relative">
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">TF-01 (Thermo)</div>
                  <div className="text-[10px] text-green-700 font-medium px-2 py-0.5 bg-green-100 rounded-full">Running</div>
                </div>
                <div className="text-xs text-muted-foreground w-full flex justify-between px-2">
                  <span>OEE</span>
                  <span className="font-bold">94%</span>
                </div>
              </div>

              {/* Machine 2 */}
              <div className="p-3 border rounded-lg bg-yellow-50/50 flex flex-col items-center justify-center gap-2">
                <div className="relative">
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full border-2 border-white"></div>
                  <Activity className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">TF-02 (Thermo)</div>
                  <div className="text-[10px] text-yellow-700 font-medium px-2 py-0.5 bg-yellow-100 rounded-full">Idle</div>
                </div>
                <div className="text-xs text-muted-foreground w-full flex justify-between px-2">
                  <span>OEE</span>
                  <span className="font-bold">78%</span>
                </div>
              </div>

              {/* Machine 3 */}
              <div className="p-3 border rounded-lg bg-red-50/50 flex flex-col items-center justify-center gap-2">
                <div className="relative">
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></div>
                  <Activity className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">EX-01 (Extruder)</div>
                  <div className="text-[10px] text-red-700 font-medium px-2 py-0.5 bg-red-100 rounded-full">Maintenance</div>
                </div>
                <div className="text-xs text-muted-foreground w-full flex justify-between px-2">
                  <span>OEE</span>
                  <span className="font-bold">0%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Center / Alerts */}
        <Card className="col-span-3 lg:col-span-3 shadow-md">
          <CardHeader>
            <CardTitle>Action Center</CardTitle>
            <CardDescription>Pending tasks & critical alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Alert 1 */}
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border-l-2 border-l-red-500">
                <div className="mt-1">
                  <Truck className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Inventory Low: PET Resin</p>
                  <p className="text-xs text-muted-foreground">Stock below 500kg. Raise PO immediately.</p>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border-l-2 border-l-orange-500">
                <div className="mt-1">
                  <FileText className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">3 Quotes Pending Approval</p>
                  <p className="text-xs text-muted-foreground">High value inquiries ($50k+).</p>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border-l-2 border-l-blue-500">
                <div className="mt-1">
                  <Package className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">QC Pending: Batch B-2024-055</p>
                  <p className="text-xs text-muted-foreground">Final inspection required for release.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/sales-inquiry">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer group">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base">Inquiries</CardTitle>
                <CardDescription>Manage incoming leads</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/sales-order">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer group">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base">Sales Orders</CardTitle>
                <CardDescription>Process confirmations</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/production">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer group">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base">Production</CardTitle>
                <CardDescription>Shop floor monitor</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dispatch">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer group">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-slate-600 group-hover:text-white transition-colors">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base">Dispatch</CardTitle>
                <CardDescription>Logistics & Invoicing</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div >
  );
}
