//=========Navbar avec collapses intégrés=========//
"use client"
import Link from "next/link"

export default function Navbar() {
  return (
    <div className="h-screen w-64 fixed top-0 left-0 bg-[#212631] text-white flex flex-col border-r border-gray-500 z-50 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4 p-4">Mon App</h1>
      <nav className="flex flex-col gap-4 p-2">
        <div className="flex flex-col gap-2">
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 text-white">
            <input type="checkbox" />
            <div className="collapse-title font-semibold">Dashboard</div>
            <div className="collapse-content text-sm flex flex-col gap-2">
              <Link href="/" className="hover:text-gray-300">
                Accueil
              </Link>
              <Link href="/Dashboard/Crypto" className="hover:text-gray-300">
                Crypto
              </Link>
              <Link href="/Dashboard/Profile" className="hover:text-gray-300">
                Profile
              </Link>
              <Link
                href="/Dashboard/Calendrier"
                className="hover:text-gray-300"
              >
                Calendrier
              </Link>
              <Link href="/Dashboard/Parametre" className="hover:text-gray-300">
                Paramètre
              </Link>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-100 border border-base-300 text-white">
            <input type="checkbox" />
            <div className="collapse-title font-semibold">
              Mot de passe oublié
            </div>
            <div className="collapse-content text-sm">
              Clique sur "Forgot Password" à la connexion et suis les
              instructions.
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-100 border border-base-300 text-white">
            <input type="checkbox" />
            <div className="collapse-title font-semibold">
              Modifier le profil
            </div>
            <div className="collapse-content text-sm">
              Va dans "Mon Compte" "Modifier le profil" pour faire les
              changements.
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
