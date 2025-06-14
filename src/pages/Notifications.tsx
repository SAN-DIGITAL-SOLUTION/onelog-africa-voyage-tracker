
import { useState } from "react";
import { Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";

export default function Notifications() {
  const [mode, setMode] = useState<"email" | "sms">("email");
  const { user } = useAuth();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <RequireAuth>
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
            placeholder={mode === "email" ? "ex: contact@email.com" : "ex: +221..."}
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
        <div className="mt-10">
          <h2 className="font-bold mb-2">Historique des notifications</h2>
          <div className="bg-white rounded shadow">
            {isLoading ? (
              <div className="text-center p-6">
                <span className="animate-spin h-7 w-7 border-4 border-onelog-bleu border-t-transparent rounded-full inline-block" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-left">Type</th>
                    <th className="px-2 py-2 text-left">Destinataire</th>
                    <th className="px-2 py-2 text-left">Message</th>
                    <th className="px-2 py-2 text-left">Envoyé le</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notif: any) => (
                    <tr key={notif.id} className="border-b last:border-none">
                      <td className="px-2 py-2">{notif.type}</td>
                      <td className="px-2 py-2">{notif.target}</td>
                      <td className="px-2 py-2">{notif.message}</td>
                      <td className="px-2 py-2">{notif.sent_at ? new Date(notif.sent_at).toLocaleString() : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-onelog-nuit/60 p-4">
                Aucune notification envoyée.
              </div>
            )}
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
