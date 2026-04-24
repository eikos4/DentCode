import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dentcode — Tu consultorio digital",
  description: "Agenda, fichas, odontograma y WhatsApp para dentistas freelance en Chile.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL">
      <body>{children}</body>
    </html>
  );
}
