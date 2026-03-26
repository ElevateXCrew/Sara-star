import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./red-effects.css";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { VisitTracker } from "@/components/VisitTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sarastar- Premium Content & Exclusive Experiences",
  description: "Discover exclusive premium content and elevate your creative journey with our curated collection. Join our community of discerning members today.",
  keywords: ["premium content", "exclusive access", "creative resources", "subscription", "membership", "gallery", "premium images"],
  authors: [{ name: "Sarastar Team" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Sarastar- Premium Content & Exclusive Experiences",
    description: "Discover exclusive premium content and elevate your creative journey with our curated collection.",
    url: "https://sarastar.com",
    siteName: "Sarastar",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarastar - Premium Content",
    description: "Discover exclusive premium content and elevate your creative journey.",
    images: ["/images/hero-bg.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/hero-bg.png" type="image/png" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            // Block F12 and DevTools shortcuts
            document.addEventListener('keydown', function(e) {
              if (e.key === 'F12') { e.preventDefault(); return false; }
              if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) { e.preventDefault(); return false; }
              if ((e.ctrlKey || e.metaKey) && ['U','u'].includes(e.key)) { e.preventDefault(); return false; }
            });
            // Block right-click on images and videos
            document.addEventListener('contextmenu', function(e) {
              var t = e.target;
              if (t && (t.tagName === 'IMG' || t.tagName === 'VIDEO' || t.closest('video'))) {
                e.preventDefault();
              }
            });
            // Block drag on images and videos
            document.addEventListener('dragstart', function(e) {
              var t = e.target;
              if (t && (t.tagName === 'IMG' || t.tagName === 'VIDEO')) {
                e.preventDefault();
              }
            });
          })();
        ` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
        <VisitTracker />
        <Toaster />
        <WhatsAppButton />
      </body>
    </html>
  );
}
