import type { Metadata } from "next";
import { RegisterServiceWorker } from "@/components/register-sw";
import { OpenObserveRum } from "@/components/OpenObserveRum";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.scouticket.fr"),
  title: {
    default: "Scouticket",
    template: "%s | Scouticket",
  },
  description:
    "Envoyez vos justificatifs et notes de frais à la trésorerie de votre groupe scout.",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Scouticket",
    title: "Scouticket",
    description:
      "Envoyez vos justificatifs et notes de frais à la trésorerie de votre groupe scout.",
    images: [{ url: "/og-scouticket.png", width: 1730, height: 909 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scouticket",
    description:
      "Envoyez vos justificatifs et notes de frais à la trésorerie de votre groupe scout.",
    images: ["/og-scouticket.png"],
  },
};

export function generateViewport() {
  return {
    themeColor: [
      {
        color: "#18181B",
      },
    ],
  };
}

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#18181B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Scouticket" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <script
          defer
          src="https://analytics.scouticket.fr/script.js"
          data-website-id="4260f7db-3623-438a-95a4-9ba2631bcc79"
        />
      </head>
      <body className="font-sans">
        <RegisterServiceWorker />
        <OpenObserveRum />
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
