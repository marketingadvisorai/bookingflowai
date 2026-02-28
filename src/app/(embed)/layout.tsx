import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BookingFlow Widget",
  description: "Book your experience",
};

export default async function EmbedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply theme from URL ?theme=dark|light, default dark.
            Sets class on <html> so Tailwind dark: prefixes + CSS vars work. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=new URLSearchParams(window.location.search).get('theme');document.documentElement.className=t==='light'?'':'dark';}catch(e){document.documentElement.className='dark';}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
