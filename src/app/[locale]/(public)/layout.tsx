import { PublicHeader } from "@/components/public-header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
