import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const geistSans = { variable: GeistSans.variable };
const geistMono = { variable: GeistMono.variable };

export const metadata: Metadata = {
  title: "FinPilot AI — Every Financial Decision, Backed by AI You Can Trust",
  description:
    "FinPilot AI is an explainable financial decision intelligence platform for SMEs. Get AI recommendations with confidence scores, financial impact, and reasoning you can act on.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
