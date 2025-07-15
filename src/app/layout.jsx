"use client";

import { useState } from "react";
import Navbar from "./components/navbar";
import Header from "./components/header";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <html data-theme="dark" lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
        <Header isOpen={isOpen} />
        <main
          className={`transition-all duration-300 ease-in-out pt-16 ${
            isOpen ? "ml-64" : "ml-16"
          }`}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
