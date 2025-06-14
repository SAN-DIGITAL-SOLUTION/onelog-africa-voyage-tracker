
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

type NotificationFormProps = {
  form: any;
  mode: "email" | "sms";
  isSending: boolean;
  onSubmit: (values: { target: string; message: string }) => void;
  onModeChange: (newMode: "email" | "sms") => void;
};

export default function NotificationForm({
  form,
  mode,
  isSending,
  onSubmit,
  onModeChange,
}: NotificationFormProps) {
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
  );
}

