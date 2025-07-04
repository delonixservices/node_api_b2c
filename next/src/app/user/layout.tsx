import Footer from "@/components/footer";
import Header from "@/components/header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TripBazaar - User",
  description: "TripBazaar - User",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <Header />
      <section className="container mx-auto px-4 py-10">
        <section>{children}</section>
      </section>
      <Footer />
    </main>
  );
}
