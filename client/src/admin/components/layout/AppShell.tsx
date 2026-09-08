import Sidebar from "@/admin/components/layout/Sidebar";

type AppShellProps = {
  action?: React.ReactNode;
  children: React.ReactNode;
  eyebrow: string;
  title: string;
};

export default function AppShell({
  action,
  children,
  eyebrow,
  title,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#faf8f3]">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[rgba(36,23,24,0.14)] bg-white px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-[#625759]">
              {eyebrow}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{title}</h1>
          </div>

          {action}
        </header>

        {children}
      </main>
    </div>
  );
}
