import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import { getTransfers } from "@/lib/data";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LINE Group Insights",
  description: "สรุปบทสนทนากลุ่ม LINE ด้วย AI",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const urgentCount = await getTransfers("pending")
    .then((t) => t.length)
    .catch(() => 0);

  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 dark:bg-black">
        <NavBar urgentCount={urgentCount} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
