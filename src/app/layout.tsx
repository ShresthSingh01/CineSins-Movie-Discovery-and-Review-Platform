import type { Metadata } from "next";
import { Inter, Playfair_Display, Outfit } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { MovieProvider } from "@/context/MovieContext";

// Vanilla CSS imports
import "../styles/vars.css";
import "../styles/palette.css";
import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";
import "../styles/animations.css";
import "../styles/dna-card.css";
import "../styles/global_vanilla.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: 'swap',
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "CineSins - Guilty Pleasures Unmasked",
  description: "A privacy-first, offline-first movie analytics & personality product",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${outfit.variable}`}>
        <AuthProvider>
          <MovieProvider>
            {children}
          </MovieProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
