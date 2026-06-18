import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventory Management System",
  description: "Modern inventory and order management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className} h-screen flex overflow-hidden bg-slate-50 print:block print:h-auto print:overflow-visible print:bg-white`} suppressHydrationWarning>
        <AppProvider>
          <div className="print:hidden">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-y-auto p-8 print:p-0 print:block print:overflow-visible print:h-auto">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
