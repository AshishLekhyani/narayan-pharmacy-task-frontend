import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Providers from "./Providers";
import { 
  Search, Filter, Bell, CircleHelp, Settings, 
  Activity, Pill, History, Plus, LogOut 
} from "lucide-react";

export const metadata: Metadata = {
  title: "Narayan Pharmacy",
  description: "Clinical Prescription Entry & Drug Interaction Checker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="bg-background text-on-background font-body-lg text-body-lg min-h-screen flex flex-col">
        <Providers>
          {/* TopNavBar */}
          <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-surface border-b border-outline-variant">
            <div className="flex items-center gap-6">
              <span className="font-headline-md text-headline-md font-bold text-primary">Narayan Pharmacy</span>
              <div className="hidden md:flex gap-4">
                <nav className="flex h-16">
                  <Link href="/" className="flex items-center px-4 h-full text-primary border-b-2 border-primary font-semibold">Dashboard</Link>
                  <Link href="/history" className="flex items-center px-4 h-full text-on-surface-variant hover:bg-surface-container-low transition-colors">Patients</Link>
                </nav>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                <input className="pl-10 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-body-sm font-body-sm w-full pr-10" placeholder="Search prescriptions..." type="text" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:bg-surface-container-low rounded-full p-1 transition-colors flex items-center justify-center">
                  <Filter size={18} />
                </button>
              </div>
            </div>
          </header>

          <div className="flex flex-1 pt-16">
            {/* Main Content Area */}
            <main className="flex-1 p-margin-desktop bg-background overflow-y-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
