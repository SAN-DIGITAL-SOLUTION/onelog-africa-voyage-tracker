
import { useState } from "react";
import { Send } from "lucide-react";

export default function Notifications() {
  const [mode, setMode] = useState<"email" | "sms">("email");

  return (
    <main className="container mx-auto pt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex gap-4 mt-2">
          <button
            className={`px-4 py-2 rounded font-bold ${
              mode === "email"
                ? "bg-onelog-bleu text-white"
                : "bg-gray-100 text-onelog-nuit"
            }`}
            onClick={() => setMode("email")}
          >
            Email
          </button>
          <button
            className={`px-4 py-2 rounded font-bold ${
              mode === "sms"
                ? "bg-onelog-bleu text-white"
                : "bg-gray-100 text-onelog-nuit"
            }`}
            onClick={() => setMode("sms")}
          >
            SMS
          </button>
        </div>
      </div>
      <form className="bg-white rounded p-6 shadow max-w-xl">
        <label className="block mb-2 font-semibold">
          {mode === "email" ? "Adresse email du destinataire" : "Téléphone du destinataire"}
        </label>
        <input
          type={mode === "email" ? "email" : "tel"}
          className="border p-2 rounded w-full mb-4"
          placeholder={mode === "email" ? "ex: contact@email.com" : "ex: +221..." }
        />
        <label className="block mb-2 font-semibold">Message</label>
        <textarea
          className="border p-2 rounded w-full min-h-[80px]"
          placeholder="Votre message à envoyer..."
        />
        <button
          type="submit"
          className="flex items-center gap-2 bg-onelog-bleu text-white font-bold px-4 py-2 rounded mt-4 hover:scale-105 transition-all"
        >
          <Send size={18} /> Envoyer
        </button>
      </form>
    </main>
  );
}
