
import { useState } from "react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen items-center justify-center bg-onelog-nuit/5">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
        <h1 className="text-2xl font-semibold mb-4">
          {isLogin ? "Connexion" : "Inscription"}
        </h1>
        <form className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block mb-1 font-bold">Email</label>
              <input type="email" className="w-full border rounded px-3 py-2" required />
            </div>
          )}
          <div>
            <label className="block mb-1 font-bold">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block mb-1 font-bold">Mot de passe</label>
            <input type="password" className="w-full border rounded px-3 py-2" required />
          </div>
          <button
            type="submit"
            className="w-full bg-onelog-bleu hover:bg-onelog-nuit text-white font-bold py-2 rounded transition-all"
          >
            {isLogin ? "Se connecter" : "Créer un compte"}
          </button>
        </form>
        <div className="text-sm text-onelog-nuit mt-4 text-center">
          {isLogin ? (
            <>
              Pas encore de compte ?{" "}
              <button
                className="text-onelog-bleu font-semibold underline"
                onClick={() => setIsLogin(false)}
              >
                S’inscrire
              </button>
            </>
          ) : (
            <>
              Déjà inscrit ?{" "}
              <button
                className="text-onelog-bleu font-semibold underline"
                onClick={() => setIsLogin(true)}
              >
                Se connecter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
