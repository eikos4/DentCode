import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SidebarAuth } from "@/components/sidebar-auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user || !user.dentistId) redirect("/login");

  const dentist = await prisma.dentist.findUnique({
    where: { id: user.dentistId },
    select: { fullName: true, email: true, verificationStatus: true, plan: true },
  });

  if (!dentist) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      <SidebarAuth
        dentistName={dentist.fullName}
        dentistEmail={dentist.email}
        verificationStatus={dentist.verificationStatus || "pending"}
        plan={dentist.plan || "trial"}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-3 md:p-6 pt-16 md:pt-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
