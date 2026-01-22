"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from "recharts";
import {
    TrendingUp,
    AlertOctagon,
    Clock,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

// Mock Data
const efficiencyData = [
    { name: 'Mon', target: 25000, actual: 24500 },
    { name: 'Tue', target: 25000, actual: 25200 },
    { name: 'Wed', target: 25000, actual: 23800 },
    { name: 'Thu', target: 25000, actual: 26000 },
    { name: 'Fri', target: 25000, actual: 25500 },
    { name: 'Sat', target: 20000, actual: 19500 },
];

const rejectionData = [
    { name: 'Visual Defects', value: 45 },
    { name: 'Dimensional', value: 25 },
    { name: 'Material Issue', value: 15 },
    { name: 'Strength/Crack', value: 15 },
];

const deliveryData = [
    { month: 'Jan', onTime: 92 },
    { month: 'Feb', onTime: 88 },
    { month: 'Mar', onTime: 95 },
    { month: 'Apr', onTime: 91 },
    { month: 'May', onTime: 96 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
                    <p className="text-muted-foreground">
                        Key Performance Indicators (KPIs) for Production, Quality, and Sales.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Production Efficiency (WTD)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98.2%</div>
                        <p className="text-xs text-muted-foreground flex items-center pt-1">
                            <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                            +2.4% from last week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
                        <AlertOctagon className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1.8%</div>
                        <p className="text-xs text-muted-foreground flex items-center pt-1">
                            <ArrowDownRight className="h-3 w-3 text-green-600 mr-1" />
                            -0.5% (Improvement)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94.5%</div>
                        <p className="text-xs text-muted-foreground flex items-center pt-1">
                            <span className="text-muted-foreground">Target: 95%</span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="production" className="space-y-4">
                <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-muted/50 p-2">
                    <TabsTrigger value="production" className="flex-1 sm:flex-none">Production Efficiency</TabsTrigger>
                    <TabsTrigger value="quality" className="flex-1 sm:flex-none">Rejection Analysis</TabsTrigger>
                    <TabsTrigger value="delivery" className="flex-1 sm:flex-none">Delivery Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="production" className="space-y-4">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Daily Production Output (Target vs Actual)</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={efficiencyData}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `${value}`} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Legend />
                                        <Bar dataKey="actual" fill="#2563eb" radius={[4, 4, 0, 0]} name="Actual Output" />
                                        <Bar dataKey="target" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Target" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Defect Distribution</CardTitle>
                                <CardDescription>Breakdown of rejection causes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={rejectionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {rejectionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top Issues</CardTitle>
                                <CardDescription>Actionable insights</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-semibold">1. Visual Defects (Scratch/Marks)</span>
                                        <span className="text-red-500 font-bold">45%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 w-[45%]" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Often caused by improper stacking or dirty mold surface.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-semibold">2. Dimensional (Wall Thickness)</span>
                                        <span className="text-orange-500 font-bold">25%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 w-[25%]" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Check heating profile in Cycle B.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="delivery" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>On-Time Delivery Trend (Yearly)</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={deliveryData}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis domain={[80, 100]} fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="onTime" stroke="#16a34a" strokeWidth={2} name="On-Time %" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
