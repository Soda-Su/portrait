import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portray - Agentic AI Talent Passport",
  description:
    "Turn existing career materials into a proof-based AI Talent Passport for AI-native roles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
