import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "./components/navbar";
import Header from "./components/header";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html data-theme="dim" lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased ml-64 pt-16`}>
        <Navbar />
        <Header />
        {children}
      </body>
    </html>
  );
}

