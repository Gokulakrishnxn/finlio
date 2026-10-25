import { CookieNotice } from "@/components/landing/cookie-notice";

// Public pages always use the white brand palette. The saved appearance still
// applies when the person enters the dashboard.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-theme min-h-dvh bg-card text-ink">
      {children}
      <CookieNotice />
    </div>
  );
}
