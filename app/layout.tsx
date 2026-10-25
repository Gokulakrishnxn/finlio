import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChatProvider } from "@/components/chat/chat-context";
import { ChatLauncher, FinlioChat } from "@/components/chat/finlio-chat";
import { SettingsProvider } from "@/components/settings/settings-dialog";
import { MobileNav, Sidebar } from "@/components/shell/sidebar";
import { SoundRoot } from "@/components/sound-root";
import { ThemeRoot } from "@/components/theme-root";
import { PricesProvider } from "@/lib/prices";
import { StoreProvider } from "@/lib/store";
import { themeScript } from "@/lib/theme";
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
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-sand text-ink">
        <ThemeRoot />
        <StoreProvider>
          <PricesProvider>
            <ChatProvider>
              <SettingsProvider>
                <div className="flex min-h-screen flex-col md:flex-row md:gap-2 md:p-2">
                  <Sidebar />
                  <MobileNav />
                  <main className="min-w-0 flex-1 bg-cream md:rounded-3xl md:border md:border-line">
                    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 md:px-8 md:py-10 xl:px-12">
                      {children}
                    </div>
                  </main>
                  <FinlioChat />
                </div>
                <ChatLauncher />
                <SoundRoot />
              </SettingsProvider>
            </ChatProvider>
          </PricesProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
