import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f8fafc] dark:bg-background text-slate-900 dark:text-slate-100 overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full max-w-full">
        <div className="hidden md:block">
            <Navbar />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full relative scroll-smooth">
          <div className="p-4 md:p-10 animate-in slide-in-from-bottom-2 duration-700 min-h-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
