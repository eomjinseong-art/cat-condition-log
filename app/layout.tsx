import Script from "next/script";
import { NadooAd } from "@/components/NadooAd";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import { VisitorCounter } from "@/components/visitor-counter";
import { APP_NAME, APP_NAME_EN, APP_SHORT_NAME, SITE_URL } from "@/lib/constants";
import "./globals.css";

const noto = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["400", "500", "700", "900"],
});

const description = `${APP_NAME}(${APP_NAME_EN}) — 10초 습관으로 남기는 고양이 하루 기록과 병원 제출용 요약`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: APP_NAME,
    template: `%s · ${APP_SHORT_NAME}`,
  },
  description,
  applicationName: APP_NAME,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description,
    images: ["/opengraph-image"],
  },
  appleWebApp: {
    capable: true,
    title: APP_SHORT_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#c45c26",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${noto.variable} h-full`}>
      <body className="min-h-full bg-paper font-sans text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: APP_NAME,
              alternateName: APP_NAME_EN,
              url: SITE_URL,
              description,
              inLanguage: "ko",
            }),
          }}
        />
        <PwaRegister />
        <VisitorCounter />
        {children}
        <NadooAd />
        <Script src="https://nadoo-ads.vercel.app/ads.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
