import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portray - Agentic Career OS",
  description:
    "Turn existing career materials into a proof-based operating system for AI-native work.",
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
