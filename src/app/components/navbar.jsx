//=========Navbar a gauche de la page=========//
"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="h-screen w-64 fixed top-0 left-0 bg-gray-800 text-white flex flex-col p-4 z-50">
      <h1 className="text-2xl font-bold mb-6">Mon App</h1>
      <nav className="flex flex-col gap-4">
        <Link href="/" className="hover:text-gray-300">Accueil</Link>
        <Link href="/Dashboard/Crypto" className="hover:text-gray-300">Crypto</Link>
        <Link href="/Dashboard/Profile">Profile</Link>
        <Link href="/Dashboard/Calendrier">Calendrier</Link>
        <Link href="/Dashboard/Parametre" className="hover:text-gray-300">Paramètre</Link>
      </nav>
    </div>
  );
}

