import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChatProvider } from "@/components/chat/chat-context";
import { SettingsProvider } from "@/components/settings/settings-dialog";
import { TourProvider } from "@/components/tour/tour";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
              {/* Tour wraps Settings: the Settings window can replay the tour. */}
              <TourProvider>
                <SettingsProvider>
                  {children}
                  <SoundRoot />
                </SettingsProvider>
              </TourProvider>
            </ChatProvider>
          </PricesProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
