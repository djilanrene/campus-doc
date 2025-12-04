import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-800">
      <main className="flex w-full max-w-4xl flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-blue-600">
            Campus Doc
          </h1>
          <p className="mt-3 text-2xl">
            Trouver. Réussir. Contribuer.
          </p>
        </div>

        <p className="mb-12 max-w-2xl text-lg leading-relaxed">
          La plateforme d'échange d'annales d'examens entre étudiants.
          Partagez vos documents pour gagner des crédits et accédez aux ressources
          dont vous avez besoin pour exceller.
        </p>

        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Link href="/connexion" className="rounded-md bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-md transition-transform duration-200 hover:scale-105">
              Se connecter
          </Link>
          <Link href="/inscription" className="rounded-md border border-gray-300 bg-white px-8 py-3 text-lg font-semibold text-blue-600 shadow-md transition-transform duration-200 hover:scale-105">
              S'inscrire
          </Link>
        </div>
      </main>

      <footer className="w-full p-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Campus Doc. Tous droits réservés.</p>
      </footer>
    </div>
  );
}