import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/shell/sidebar";
import { PricesProvider } from "@/lib/prices";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finlio Daily",
  description:
    "A plain-English daily briefing on the stocks you own: what changed, what's coming up, and what deserves your attention.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-sand text-ink">
        <StoreProvider>
          <PricesProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="m-2 ml-0 min-w-0 flex-1 rounded-3xl border border-line bg-cream">
                <div className="mx-auto w-full max-w-[1100px] px-6 py-10 md:px-10 md:py-14 xl:px-16">
                  {children}
                </div>
              </main>
            </div>
          </PricesProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
