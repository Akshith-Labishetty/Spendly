import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Spendly — Personal Expense Tracker",
    template: "%s | Spendly",
  },
  description:
    "Understand where your money goes. Track expenses, import bank statements, and get spending insights with Spendly.",
  keywords: ["expense tracker", "personal finance", "budget", "spending"],
  openGraph: {
    title: "Spendly — Personal Expense Tracker",
    description: "Understand where your money goes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
