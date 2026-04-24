import { SidebarAuth } from "../../components/sidebar-auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarAuth />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
