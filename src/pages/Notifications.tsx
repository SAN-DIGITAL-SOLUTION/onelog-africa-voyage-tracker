
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import NotificationForm from "./notifications/NotificationForm";
import NotificationHistory from "./notifications/NotificationHistory";

const notificationSchema = z.object({
  mode: z.union([z.literal("email"), z.literal("sms")]),
  target: z.string().min(3, "Champ requis"),
  message: z.string().min(2, "Veuillez écrire un message"),
  mission_id: z.string().optional(),
  trigger: z.string().optional(),
});

// For demo: continues to use fake SMS
async function sendSMS(target: string, message: string, user_id: string) {
  return { success: true };
}

// MailerSend email sending via edge function
async function sendEmailEdge({ target, message, user_id, mission_id, trigger }: { target: string, message: string, user_id: string, mission_id?: string, trigger?: string }) {
  // Minimal HTML for mail content
  const message_html = `<p>${message}</p>`;
  const message_text = message;
  const body = {
    recipient_email: target,
    message_html,
    message_text,
    user_id,
    mission_id: mission_id || null,
    trigger: trigger || null,
  };
  const url = `https://fhiegxnqgjlgpbywujzo.functions.supabase.co/send-notification-email`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = { error: await res.text() };
    }
    throw new Error(err.error || "Erreur lors de l'envoi via MailerSend.");
  }
  return await res.json();
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
      mission_id: "",
      trigger: "",
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

  // Mutation : envoie notification via email/sms et stocke dans Supabase
  const { mutate: sendNotification, isPending: isSending } = useMutation({
    mutationFn: async (values: { mode: "email" | "sms"; target: string; message: string; mission_id?: string; trigger?: string }) => {
      if (!user) throw new Error("Non authentifié");
      // 1. Envoi (edge/email/sms)
      if (values.mode === "sms") {
        await sendSMS(values.target, values.message, user.id);
      } else {
        // Mode email: call edge function
        await sendEmailEdge({
          target: values.target,
          message: values.message,
          user_id: user.id,
          mission_id: values.mission_id,
          trigger: values.trigger,
        });
      }
      // 2. Enregistrement Supabase (inclut mission_id et trigger)
      const { error } = await supabase.from("notifications").insert({
        user_id: user.id,
        type: values.mode,
        target: values.target,
        message: values.message,
        sent_at: new Date().toISOString(),
        mission_id: values.mission_id || null,
        trigger: values.trigger || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: "Notification envoyée !",
        description: "Votre notification a été enregistrée et envoyée.",
      });
      form.reset({ mode, target: "", message: "", mission_id: "", trigger: "" });
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

  function handleMode(newMode: "email" | "sms") {
    setMode(newMode);
    form.setValue("mode", newMode);
    form.reset({ mode: newMode, target: "", message: "", mission_id: "", trigger: "" });
  }

  function handleFormSubmit({ target, message, mission_id, trigger }: { target: string; message: string; mission_id?: string; trigger?: string }) {
    sendNotification({ mode, target, message, mission_id, trigger });
  }

  return (
    <RequireAuth>
      <main className="container mx-auto pt-8 px-2 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Notifications</h1>
          <p className="text-gray-600">
            Envoyez des notifications par email ou SMS et consultez l'historique.
          </p>
        </div>
        <NotificationForm
          form={form}
          mode={mode}
          isSending={isSending}
          onSubmit={handleFormSubmit}
          onModeChange={handleMode}
        />
        <NotificationHistory
          notifications={notifications || []}
          isLoading={isLoading}
        />
      </main>
    </RequireAuth>
  );
}
