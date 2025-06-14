
import { useState } from "react";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const notificationSchema = z.object({
  mode: z.union([z.literal("email"), z.literal("sms")]),
  target: z.string().min(3, "Champ requis"),
  message: z.string().min(2, "Veuillez écrire un message"),
});

// Pour le SMS, à brancher si tu veux faire une API Edge function Supabase plus tard
async function sendSMS(target: string, message: string, user_id: string) {
  // Simule l'envoi : intégrer une edge function + Twilio si tu veux le vrai
  // Lance un toast pour info
  return { success: true };
}

// Simple "fake send" pour email : à brancher pour usage réel
async function sendEmail(target: string, message: string, user_id: string) {
  // Simule l'envoi, tu peux brancher une vraie edge function plus tard
  return { success: true };
}

export default function Notifications() {
  const [mode, setMode] = useState<"email" | "sms">("email");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      mode: mode,
      target: "",
      message: "",
    },
  });

  // Historique des notifications
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

  // Mutation : envoie notification via email/sms et stocke dans Supabase
  const { mutate: sendNotification, isPending: isSending } = useMutation({
    mutationFn: async (values: { mode: "email" | "sms"; target: string; message: string }) => {
      if (!user) throw new Error("Non authentifié");
      // 1. Envoi (email/sms)
      if (values.mode === "sms") {
        await sendSMS(values.target, values.message, user.id);
      } else {
        await sendEmail(values.target, values.message, user.id);
      }
      // 2. Enregistrement Supabase
      const { error } = await supabase.from("notifications").insert({
        user_id: user.id,
        type: values.mode,
        target: values.target,
        message: values.message,
        sent_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: "Notification envoyée !",
        description: "Votre notification a été enregistrée et envoyée.",
      });
      form.reset({ mode, target: "", message: "" });
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  // Quand on change l’onglet (email/sms), maj le form
  function handleMode(newMode: "email" | "sms") {
    setMode(newMode);
    form.setValue("mode", newMode);
    form.reset({ mode: newMode, target: "", message: "" });
  }

  return (
    <RequireAuth>
      <main className="container mx-auto pt-8 px-2 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Notifications</h1>
          <div className="flex gap-4 mt-2">
            <Button variant={mode === "email" ? "default" : "outline"} onClick={() => handleMode("email")}>
              Email
            </Button>
            <Button variant={mode === "sms" ? "default" : "outline"} onClick={() => handleMode("sms")}>
              SMS
            </Button>
          </div>
        </div>
        <section className="bg-white rounded p-6 shadow max-w-xl mx-auto mb-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) =>
                sendNotification({
                  mode,
                  target: values.target,
                  message: values.message,
                })
              )}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {mode === "email"
                        ? "Adresse email du destinataire"
                        : "Téléphone du destinataire"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={mode === "email" ? "email" : "tel"}
                        autoComplete={mode === "email" ? "email" : "tel"}
                        placeholder={
                          mode === "email"
                            ? "ex : contact@email.com"
                            : "ex : +221..."
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {mode === "email"
                        ? "Le destinataire recevra un email."
                        : "Le destinataire recevra un SMS."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Votre message à envoyer…"
                        {...field}
                        className="resize-y min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSending}
                  className="flex items-center gap-2"
                >
                  {isSending ? (
                    <span className="animate-spin rounded-full border-2 border-t-transparent border-white w-4 h-4 inline-block" />
                  ) : (
                    <Send size={18} />
                  )}
                  Envoyer
                </Button>
              </div>
            </form>
          </Form>
        </section>
        <section className="mt-10">
          <h2 className="font-bold mb-4">Historique des notifications</h2>
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
                      <td className="px-2 py-2">{notif.type.toUpperCase()}</td>
                      <td className="px-2 py-2">{notif.target}</td>
                      <td className="px-2 py-2">{notif.message}</td>
                      <td className="px-2 py-2">
                        {notif.sent_at
                          ? new Date(notif.sent_at).toLocaleString("fr-FR")
                          : ""}
                      </td>
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
        </section>
      </main>
    </RequireAuth>
  );
}
