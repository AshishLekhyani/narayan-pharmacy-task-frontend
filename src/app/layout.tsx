import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Providers from "./Providers";
import { 
  Search, Filter, Bell, CircleHelp, Settings, 
  Activity, Pill, History, Plus, LogOut 
} from "lucide-react";

export const metadata: Metadata = {
  title: "PharmaSync Pro",
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
              <span className="font-headline-md text-headline-md font-bold text-primary">PharmaSync Pro</span>
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
              <div className="flex items-center gap-2 text-on-surface-variant">
                <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors"><Bell size={20} /></button>
                <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors"><CircleHelp size={20} /></button>
                <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors"><Settings size={20} /></button>
              </div>
              <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant ml-2">
                <img alt="Pharmacist Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHkreHm6pcSZ2hjp_LYh8IBGarZtofE74ZwCeSzTdKBmlYxubzF5CSeeu5lmkNj_GlJAkXd5It14cejYzRw-RuaXVDvpdbbQ1XF4byLkGXKXk5kHag8Hw2jcl2UM5XALTz-ze0PAfVjZ28nAyikOLc3v2bBsfg1zaHRkVkB_sNox3zMEuu297iCMcc-dYWT-rxYi5Ken9uRkUVFgjUfdCmqMFxR8hzNE6-seLiuQvMbqYnRPRabVwey1Mk5eDNJsjZb8IbXfs-qX3H" />
              </div>
            </div>
          </header>

          <div className="flex flex-1 pt-16">
            {/* SideNavBar */}
            <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] flex flex-col p-4 w-64 bg-surface-container-low border-r border-outline-variant hidden md:flex">
              <div className="mb-8 px-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">Central Pharmacy</h3>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Station 04</p>
                  </div>
                </div>
              </div>
              <nav className="space-y-1 flex-1">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container font-bold rounded-lg">
                  <Pill size={20} />
                  <span className="font-body-sm text-body-sm">Prescription Entry</span>
                </Link>
                <Link href="/history" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all rounded-lg">
                  <History size={20} />
                  <span className="font-body-sm text-body-sm">History</span>
                </Link>
              </nav>
              <button className="mt-4 mb-8 w-full bg-primary text-on-primary py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold hover:opacity-90 transition-opacity">
                <Plus size={20} />
                <span className="font-body-sm text-body-sm">New Entry</span>
              </button>
              <div className="pt-4 border-t border-outline-variant space-y-1">
                <Link href="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-high transition-all rounded-lg">
                  <Settings size={20} />
                  <span className="font-body-sm text-body-sm">Settings</span>
                </Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-high transition-all rounded-lg">
                  <LogOut size={20} />
                  <span className="font-body-sm text-body-sm">Log Out</span>
                </Link>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 p-margin-desktop bg-background overflow-y-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
