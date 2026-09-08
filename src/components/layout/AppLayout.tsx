import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
      <div
        className="min-h-screen transition-[padding] duration-300"
        style={{ paddingLeft: collapsed ? 72 : 256 }}
      >
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
