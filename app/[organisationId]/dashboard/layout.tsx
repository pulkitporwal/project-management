import { ReactNode } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TopBar } from '@/components/layout/TopBar';

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ organisationId: string }>;
}>) {
  const { organisationId } = await params;
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar organisationId={organisationId} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
