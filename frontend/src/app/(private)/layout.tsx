// import Navbar from '@/src/components/navbar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/*<Navbar />*/}
      <main className="grow">{children}</main>
    </div>
  );
}
