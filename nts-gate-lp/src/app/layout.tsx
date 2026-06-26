import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  Poppins,
  Zen_Kaku_Gothic_New,
} from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import CleanGlParam from "@/components/shared/CleanGlParam";
import "./globals.css";

/** 模倣元サイトに合わせたフォント（Poppins + Zen Kaku Gothic New） */
const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-zen-kaku-gothic-new",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "補助金照会・ご案内 | 人手不足・設備投資に使える制度を確認 — 日本提携支援",
  description:
    "人手不足、設備の老朽化、事業承継でお悩みの経営者へ。会社名と業種から、御社に活用できる可能性のある補助金制度のイメージを無料で照会できます。個人情報の入力は不要です。",
  keywords:
    "補助金 照会, 人手不足 解決策, 設備投資 補助金, 事業承継 補助金, 省力化補助金, 中小企業 支援",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.webp", type: "image/webp" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "あなたの経営課題に、使える補助金があるかもしれません。",
    description: "会社名と業種から無料で照会。個人情報の入力は不要です。",
    type: "website",
  },
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${zenKakuGothicNew.variable} ${poppins.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        {GTM_ID && (
          <Script id="gtm-base" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `}
          </Script>
        )}
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <Suspense fallback={null}>
          <CleanGlParam />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
