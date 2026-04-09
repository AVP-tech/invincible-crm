type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.3em] text-moss">{eyebrow}</p> : null}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400 md:text-base">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
