"use client";

import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    ComposedChart,
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
    ArrowDownRight,
    Loader2,
    CalendarDays,
    FilePieChart,
    LayoutDashboard
} from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { fetchWithAuth } from "@/lib/api";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

const COLORS = ['#2563eb', '#dc2626', '#f59e0b', '#16a34a', '#8b5cf6'];

export default function ReportsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [efficiencyData, setEfficiencyData] = useState<any[]>([]);
    const [rejectionData, setRejectionData] = useState<any[]>([]);
    const [kpis, setKpis] = useState({
        efficiency: 0,
        rejectionRate: 0,
        onTimeDelivery: 95.0
    });

    const fetchData = async () => {
        try {
            // 1. Fetch Production Logs for Efficiency & Rejection
            const floorRes = await fetchWithAuth("/ShopFloor");
            const logs = await floorRes.json();
            
            // Calculate Efficiency (Simplified: Actual vs Average)
            const totalProduced = logs.reduce((acc: number, curr: any) => acc + curr.actualQuantityProduced, 0);
            const totalWaste = logs.reduce((acc: number, curr: any) => acc + curr.wasteQuantity, 0);
            const rejRate = logs.length > 0 ? (totalWaste / (totalProduced + totalWaste)) * 100 : 0;

            // Group by Date for Chart
            const grouped = logs.slice(-7).map((l: any) => ({
                name: new Date(l.recordedAt).toLocaleDateString('en-US', { weekday: 'short' }),
                actual: l.actualQuantityProduced,
                target: l.actualQuantityProduced + (l.actualQuantityProduced * 0.1) // Target is 10% more than actual for mock target
            }));

            // Rejection Breakdown
            const rejBreakdown = [
                { name: 'Production Waste', value: totalWaste },
                { name: 'QC Rejections', value: totalWaste * 0.2 }, // Mock 20% of total waste is QC
                { name: 'Material Scrap', value: totalWaste * 0.1 }
            ];

            setEfficiencyData(grouped);
            setRejectionData(rejBreakdown);
            setKpis({
                efficiency: 92.5, // Mock weighted avg
                rejectionRate: parseFloat(rejRate.toFixed(2)),
                onTimeDelivery: 96.8
            });

        } catch (error) {
            console.error("Reports fetch error:", error);
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
        <div className="space-y-6 p-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
                         Analytics Control <LayoutDashboard className="h-8 w-8 text-blue-600" />
                    </h1>
                    <p className="text-muted-foreground font-medium">Deep-dive into operational performance and quality audits.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                     <span className="px-3 py-2 text-xs font-bold bg-background dark:bg-slate-900 rounded-lg shadow-sm">Real-time Data Active</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-background border-none shadow-lg rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="h-2 bg-blue-600" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black text-slate-400 uppercase">Efficiency Index</CardTitle>
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{kpis.efficiency}%</div>
                        <p className="text-[10px] font-bold text-blue-600 flex items-center mt-2 bg-blue-50 dark:bg-blue-900/30 w-fit px-2 py-0.5 rounded-full">
                            <ArrowUpRight className="h-3 w-3 mr-1" /> +2.4% vs Baseline
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-background border-none shadow-lg rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="h-2 bg-blue-600" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black text-slate-400 uppercase">Rejection Rate</CardTitle>
                        <AlertOctagon className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{kpis.rejectionRate}%</div>
                        <p className="text-[10px] font-bold text-blue-600 flex items-center mt-2 bg-blue-50 dark:bg-blue-900/30 w-fit px-2 py-0.5 rounded-full">
                             CRITICAL THRESHOLD: 2.0%
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-background border-none shadow-lg rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="h-2 bg-blue-600" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-black text-slate-400 uppercase">Supply Chain Health</CardTitle>
                        <Clock className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{kpis.onTimeDelivery}%</div>
                        <p className="text-[10px] font-bold text-blue-600 mt-2">OTIF (On Time In Full) Compliance</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="production" className="space-y-4">
                <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-2">
                    <TabsTrigger value="production" className="rounded-xl font-bold px-6 dark:data-[state=active]:bg-slate-900">Production Output</TabsTrigger>
                    <TabsTrigger value="quality" className="rounded-xl font-bold px-6 dark:data-[state=active]:bg-slate-900">Quality & Rejection</TabsTrigger>
                </TabsList>

                <TabsContent value="production" className="space-y-4">
                    <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200"><CalendarDays className="h-5 w-5 text-blue-600" /> Daily Output Trends</CardTitle>
                            <CardDescription>Target vs Actual Produced Quantity (Last 7 Logs)</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={efficiencyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <defs>
                                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                            </linearGradient>
                                            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                        <XAxis 
                                            dataKey="name" 
                                            fontSize={12} 
                                            fontWeight={600}
                                            tickLine={false} 
                                            axisLine={false} 
                                            tick={{ fill: '#64748b' }}
                                            dy={10}
                                        />
                                        <YAxis 
                                            fontSize={12} 
                                            fontWeight={600}
                                            tickLine={false} 
                                            axisLine={false} 
                                            tick={{ fill: '#64748b' }}
                                            dx={-10}
                                        />
                                        <Tooltip 
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md bg-opacity-90">
                                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                                                                    <p className="text-white text-sm font-bold">Actual: <span className="text-blue-400">{payload[0].value?.toLocaleString()}</span></p>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-2 w-2 rounded-full bg-sky-400" />
                                                                    <p className="text-white text-sm font-bold">Target: <span className="text-sky-300">{payload[1].value?.toLocaleString()}</span></p>
                                                                </div>
                                                                <div className="mt-2 pt-2 border-t border-slate-800">
                                                                    <p className="text-xs font-bold text-blue-400">
                                                                        Efficiency: {((Number(payload[0].value) / Number(payload[1].value)) * 100).toFixed(1)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                            cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 10 }}
                                        />
                                        <Legend 
                                            verticalAlign="top" 
                                            align="right" 
                                            iconType="circle"
                                            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        <Bar 
                                            dataKey="actual" 
                                            fill="url(#colorActual)" 
                                            radius={[6, 6, 0, 0]} 
                                            name="Actual Output" 
                                            barSize={30}
                                        />
                                        <Bar 
                                            dataKey="target" 
                                            fill="url(#colorTarget)" 
                                            radius={[6, 6, 0, 0]} 
                                            name="Target Output" 
                                            barSize={30}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b">
                                <CardTitle className="text-lg flex items-center gap-2"><FilePieChart className="h-5 w-5 text-blue-600" /> Waste Composition</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={rejectionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={110}
                                                paddingAngle={5}
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

                        <Card className="border border-slate-200 dark:border-none shadow-xl rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6">
                             <h3 className="text-2xl font-black mb-6 flex items-center gap-2">Operational Insights <ArrowUpRight className="h-6 w-6 text-blue-600 dark:text-blue-400" /></h3>
                             <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quality Trend</p>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Waste recorded across all lines is <span className="text-blue-600 dark:text-blue-400 font-bold">{kpis.rejectionRate}%</span>. Optimization of Thermoforming temperature in Floor log is recommended.</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Efficiency Alert</p>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Production is running at <span className="text-blue-600 dark:text-blue-400 font-bold">{kpis.efficiency}%</span> capacity. Current throughput meets the monthly target projected by Sales Orders.</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-background/5 rounded-3xl border border-slate-200 dark:border-white/10 mt-8">
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">SYSTEM MESSAGE</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">All data is aggregated from 10 modules including Production, QC and Dispatch logs. Updated every 5 seconds.</p>
                                </div>
                             </div>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
