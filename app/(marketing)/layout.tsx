// The public pages: no sidebar, no chat, no welcome screen.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-card">{children}</div>;
}
