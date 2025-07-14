//=========Page d'accueil => ère page que l'utilisateur voit=========//

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Page d'accueil</h1>
      <p className="mt-4 text-lg">Bienvenue sur notre application Next.js !</p>
      <a className="btn btn-primary">Button</a>
    </div>
  );
}
