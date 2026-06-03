import { AdminSubNav } from "@/components/admin/admin-sub-nav";
import { Navbar } from "@/components/navbar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <AdminSubNav />
      {children}
    </>
  );
}
