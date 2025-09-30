import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import RequireAuth from "@/components/RequireAuth";
import { SlideDownHeader } from "@/components/SlideDownHeader";
import { CardFade } from "@/components/CardFade";
import { AnimatedAfrica } from "@/components/AnimatedAfrica";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import NotificationForm from "./notifications/NotificationForm";
import NotificationHistory from "./notifications/NotificationHistory";
import "@/styles/animations.css";

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
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-purple-50">
        <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
          {/* Header avec design amélioré */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2zM4 7h12V5H4v2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                  <p className="text-gray-600 text-lg">
                    Envoyez des notifications par email ou SMS et consultez l'historique
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats rapides */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Emails envoyés</p>
                    <p className="text-xl font-bold text-blue-800">{notifications?.filter(n => n.type === 'email').length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">SMS envoyés</p>
                    <p className="text-xl font-bold text-green-800">{notifications?.filter(n => n.type === 'sms').length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total notifications</p>
                    <p className="text-xl font-bold text-purple-800">{notifications?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Formulaire d'envoi */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Envoyer une notification</h2>
              </div>
              <NotificationForm
                form={form}
                mode={mode}
                isSending={isSending}
                onSubmit={handleFormSubmit}
                onModeChange={handleMode}
              />
            </div>

            {/* Historique */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Historique des notifications</h2>
              </div>
              <NotificationHistory
                notifications={notifications || []}
                isLoading={isLoading}
              />
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
