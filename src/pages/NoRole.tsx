
export default function NoRole() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-onelog-nuit/10 font-['PT Sans']">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-xl w-full flex flex-col items-center">
        <span className="text-5xl mb-4">🛑</span>
        <h1 className="text-2xl font-bold mb-2 text-red-600">Aucun rôle attribué</h1>
        <p className="text-center text-onelog-nuit mb-1">
          Votre compte n’a pas encore de rôle défini dans le système.
        </p>
        <p className="text-center text-onelog-nuit mb-4">
          Veuillez contacter un administrateur pour l’attribution de votre rôle.
        </p>
      </div>
    </div>
  );
}
