import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "CineSins | The Forensic Science of Film",
  description: "A premium movie discovery platform focused on honest criticism, cinematic debate, and the forensic breakdown of film sins.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground selection:bg-primary selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
