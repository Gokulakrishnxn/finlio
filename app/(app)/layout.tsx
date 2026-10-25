import { ChatLauncher, FinlioChat } from "@/components/chat/finlio-chat";
import { AuthGate } from "@/components/auth/auth-gate";
import { MobileNav, Sidebar } from "@/components/shell/sidebar";

// The app shell: sidebar, page card and the Finlio chat. The landing page at /
// lives outside it.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="flex min-h-screen flex-col md:flex-row md:gap-2 md:p-2">
        <Sidebar />
        <MobileNav />
        <main className="min-w-0 flex-1 bg-cream md:rounded-3xl md:border md:border-line">
          <div className="mx-auto w-full max-w-[1180px] px-4 py-6 md:px-8 md:py-10 xl:px-12">{children}</div>
        </main>
        <FinlioChat />
      </div>
      <ChatLauncher />
    </AuthGate>
  );
}
