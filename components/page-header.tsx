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
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10 md:gap-6">
      <div>
        <h1 className="text-[30px] leading-tight font-semibold tracking-tight text-ink md:text-[40px]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[30px] leading-tight font-semibold tracking-tight text-[#a8a7a3] md:text-[40px]">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
