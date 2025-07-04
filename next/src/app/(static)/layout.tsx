import Footer from "@/components/footer";
import Header from "@/components/header";
import type { Metadata } from "next";
// import Link from "next/link";
import FooterLeftPanel from "@/components/static/footerLeftPanel";
export const metadata: Metadata = {
  title: "TripBazaar - ",
  description: "TripBazaar - ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <section className="container mx-auto flex-1 px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
         <FooterLeftPanel />
         
          <section className="flex-1">{children}</section>
        </div>
      </section>
      <Footer />
    </main>
  );
}
