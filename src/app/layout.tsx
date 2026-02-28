import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import { generateOrganizationSchema, generateSoftwareApplicationSchema, renderStructuredData } from "@/lib/seo/structured-data";
import { GoogleAdsScript } from "@/components/google-ads-script";
import { ChatWidget } from "@/components/chat/chat-widget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = genMeta({
  title: "BookingFlow — The Booking Platform Built for Venues",
  description: "The booking platform built for venues. AI chatbot, voice agent, email marketing, and smart scheduling. Fill every time slot without lifting a finger.",
  path: "",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const softwareSchema = generateSoftwareApplicationSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WXNR29BQ');` }} />
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-N47TWPL5T8" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-N47TWPL5T8');` }} />
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={renderStructuredData(organizationSchema)}
        />
        {/* SoftwareApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={renderStructuredData(softwareSchema)}
        />
      </head>
      <body className={`${inter.variable} ${dmSans.variable} font-sans`}>
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WXNR29BQ" height={0} width={0} style={{display:'none',visibility:'hidden'}} /></noscript>
        <GoogleAdsScript />
        <ThemeProvider>{children}</ThemeProvider>
        <ChatWidget />
      </body>
    </html>
  );
}
