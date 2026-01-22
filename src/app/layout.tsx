import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PolyTrack ERP - Sales to Dispatch",
  description: "End-to-end Sales Inquiry to Dispatch Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col md:flex-row h-screen bg-background text-foreground overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-muted/10 w-full">
            <div className="p-4 md:p-8 animate-in fade-in zoom-in-95 duration-500">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
