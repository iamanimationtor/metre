import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/vazirmatn";
import { siteBase } from "@/lib/site";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(siteBase()),
  title: {
    default: "HERMIMETR | سیستم متره و برآورد هزینه ساخت ساختمان در ایران",
    template: "%s | HERMIMETR",
  },
  description:
    "سیستم متره و برآورد آنلاین هزینه ساخت ساختمان با شاخص‌های قیمتی خودکار (مبنای آبان ۱۴۰۵)، ریزترین جزئیات مصالح و دستمزد و عوارض قانونی؛ مطابق فهرست بهای سازمان برنامه و تعرفه نظام مهندسی.",
  keywords: ["متره و برآورد", "هزینه ساخت ساختمان", "برآورد آنلاین ساخت", "قیمت ساخت آپارتمان ۱۴۰۵", "فهرست بها", "نظام مهندسی"],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "HERMIMETR",
    title: "HERMIMETR | سیستم متره و برآورد هزینه ساخت",
    description: "متره پارامتریک، تفکیک دستمزد و مصالح، زمان‌بندی اجرا و خروجی Excel — مطابق بازار و قوانین ایران.",
    images: [{ url: "/images/og-card.png", width: 1200, height: 630, alt: "HERMIMETR" }],
  },
  twitter: { card: "summary_large_image", images: ["/images/og-card.png"] },
  icons: { icon: "/icons/icon-512.png", apple: "/icons/icon-512.png" },
};

export const viewport: Viewport = {
  themeColor: "#065f46",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-dvh bg-slate-50 font-sans text-slate-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-slate-900 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
        >
          پرش به محتوای اصلی
        </a>
        <div className="flex min-h-dvh flex-col">
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
