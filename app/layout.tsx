import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import { APP_NAME, APP_NAME_EN, APP_SHORT_NAME } from "@/lib/constants";
import "./globals.css";

const noto = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_SHORT_NAME}`,
  },
  description: `${APP_NAME}(${APP_NAME_EN}) — 10초 습관으로 남기는 고양이 하루 기록과 병원 제출용 요약`,
  applicationName: APP_NAME,
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
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
