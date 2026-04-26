import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dentcode — Ecosistema Odontológico",
  description: "Agenda, fichas, odontograma y WhatsApp para dentistas y clínicas en Chile.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/favicon-32x32.png",
    shortcut: "/icons/favicon.ico",
    apple: "/icons/apple-icon-180x180.png",
  },
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL">
      <body>{children}</body>
    </html>
  );
}
