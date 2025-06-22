import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/backend/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resco - AI-Powered LaTeX Resume Editor",
  description: "Create, edit, and optimize your LaTeX resume with AI assistance. GitHub-style diffs, version control, and job-specific optimization.",
  keywords: ["resume", "latex", "ai", "editor", "job", "career"],
  authors: [{ name: "Resco Team" }],
  openGraph: {
    title: "Resco - AI-Powered LaTeX Resume Editor",
    description: "Create, edit, and optimize your LaTeX resume with AI assistance",
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
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
