import type { Metadata } from "next";
import { Onest, Space_Grotesk } from "next/font/google";
import "./globals.css";

/**
 * Set the persisted theme before first paint so a stored light theme doesn't
 * flash the dark default. Dark is the implicit baseline (no attribute needed).
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem("pathport-theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

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
    <html
      lang="en"
      className={`${onest.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/** biome-ignore lint/security/noDangerouslySetInnerHtml: tiny static no-flash theme bootstrap */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
