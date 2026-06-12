import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";
import Navigation from "../components/Navigation";

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
              <div className="flex gap-2 md:gap-4 text-body-sm md:text-base overflow-x-auto">
                <Navigation />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Optional: Future global actions can go here */}
            </div>
          </header>

          <div className="flex flex-1 pt-16">
            {/* Main Content Area */}
            <main className="flex-1 p-margin-desktop bg-background">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
