import type { Metadata } from "next";
import "./globals.css";
import { PERSONA } from "@/config/persona";

export const metadata: Metadata = {
  title:       `${PERSONA.name} — AI Portfolio`,
  description: `Talk to ${PERSONA.name}'s AI twin. ${PERSONA.title}`,
  openGraph: {
    title:       `${PERSONA.name} — AI Portfolio Twin`,
    description: `An interactive AI version of ${PERSONA.name} living on the internet.`,
    type:        "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
