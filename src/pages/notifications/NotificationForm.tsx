
import { Send } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "@/hooks/useAuth";

type NotificationFormProps = {
  form: any;
  mode: "email" | "sms";
  isSending: boolean;
  onSubmit: (values: { target: string; message: string; mission_id?: string; trigger?: string }) => void;
  onModeChange: (newMode: "email" | "sms") => void;
};

// Options prédéfinies pour les triggers
const triggerOptions = [
  { value: "created", label: "Mission créée" },
  { value: "modified", label: "Mission modifiée" },
  { value: "delivered", label: "Mission livrée" },
  { value: "cancelled", label: "Mission annulée" },
  { value: "in_progress", label: "Mission en cours" },
  { value: "custom", label: "Personnalisé" },
];

export default function NotificationForm({
  form,
  mode,
  isSending,
  onSubmit,
  onModeChange,
}: NotificationFormProps) {
  const { user } = useAuth();

  // Récupérer les missions de l'utilisateur pour le sélecteur
  const { data: missions } = useQuery({
    queryKey: ["user-missions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("missions")
        .select("id, ref, client, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <section className="bg-white rounded p-6 shadow max-w-xl mx-auto mb-6">
      <div className="flex gap-4 mb-6">
        <Button
          variant={mode === "email" ? "default" : "outline"}
          onClick={() => onModeChange("email")}
          type="button"
        >
          Email
        </Button>
        <Button
          variant={mode === "sms" ? "default" : "outline"}
          onClick={() => onModeChange("sms")}
          type="button"
        >
          SMS
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values: any) =>
            onSubmit({
              target: values.target,
              message: values.message,
              mission_id: values.mission_id || undefined,
              trigger: values.trigger || undefined,
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
                        ? "ex : contact@email.com"
                        : "ex : +221..."
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
            name="mission_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mission associée (optionnel)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une mission" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {missions?.map((mission) => (
                      <SelectItem key={mission.id} value={mission.id}>
                        {mission.ref} - {mission.client} ({mission.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Associer cette notification à une mission spécifique.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trigger"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Évènement déclencheur (optionnel)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un évènement" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {triggerOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Spécifier l'évènement qui a déclenché cette notification.
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
  );
}
