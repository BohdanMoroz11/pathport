import type { Metadata } from "next";
import { Onest, Space_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

/** Body/UI typeface. */
const onest = Onest({ subsets: ["latin"], variable: "--font-onest", display: "swap" });
/** Display typeface for headings and numeric values. */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pathport",
  description: "Immigration options, structured and source-aware.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${onest.variable} ${spaceGrotesk.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
