export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-10 flex items-end justify-between gap-6">
      <div>
        <h1 className="text-[40px] leading-tight font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && (
          <p className="text-[40px] leading-tight font-semibold tracking-tight text-[#a8a7a3]">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
