import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { GlobalLoadingProvider } from "@/components/providers/GlobalLoadingProvider";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZAPSTERS — Hackathon Operating System",
  description: "The competition infrastructure platform for hackathons. Run competitions, build teams, track progress, judge better.",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="icon"
          href="/images/logo.png"
          type="image/png"
          style={{ transform: 'scale(1) translate(0px, 0px)' } as React.CSSProperties}
        />
        <link rel="shortcut icon" href="/images/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-black text-white font-inter selection:bg-[#800000] selection:text-white"
      >
        <AuthProvider>
          <GlobalLoadingProvider>{children}</GlobalLoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
