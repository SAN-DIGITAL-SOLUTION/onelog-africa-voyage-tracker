
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, ChevronRight } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const missionSchema = z.object({
  ref: z.string().min(1, "Référence obligatoire"),
  client: z.string().min(1, "Client obligatoire"),
  chauffeur: z.string().optional(),
  date: z.string().min(1, "Date obligatoire"),
  status: z.string().min(1, "Statut obligatoire"),
  description: z.string().optional()
});

const statusOptions = ["En cours", "Terminée", "Annulée"];

export default function MissionForm({ editMode = false }: { editMode?: boolean }) {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [defaultValues, setDefaultValues] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  // Charger mission à éditer si besoin
  React.useEffect(() => {
    if (editMode && params.id) {
      setLoading(true);
      supabase.from("missions").select("*").eq("id", params.id).single()
        .then(({ data, error }) => {
          if (error) {
            toast({ title: "Erreur", description: "Impossible de charger la mission.", variant: "destructive" });
            navigate("/missions");
            return;
          }
          setDefaultValues({
            ...data,
            // date: data.date ? data.date.split("T")[0] : ""
          });
          setLoading(false);
        });
    }
  }, [editMode, params.id, navigate]);

  const form = useForm({
    resolver: zodResolver(missionSchema),
    defaultValues: defaultValues || {
      ref: "",
      client: "",
      chauffeur: "",
      date: "",
      status: "",
      description: ""
    }
  });

  // Synchronise form si chargement
  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
      });
    }
    // eslint-disable-next-line
  }, [defaultValues]);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (editMode && params.id) {
        // Update
        const { error } = await supabase.from("missions").update({
          ...values,
          updated_at: new Date().toISOString()
        }).eq("id", params.id);
        if (error) throw error;
        toast({ title: "Mission mise à jour", description: "Les modifications ont été enregistrées." });
        navigate(`/missions/${params.id}`);
      } else {
        // Création
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error("Utilisateur non authentifié");
        const { error } = await supabase.from("missions").insert({
          ...values,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
        toast({ title: "Mission créée", description: "La mission a été ajoutée." });
        navigate("/missions");
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // DatePicker (recommandation shadcn)
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  return (
    <main className="container mx-auto pt-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'PT Sans',sans-serif" }}>
        {editMode ? "Éditer la mission" : "Nouvelle mission"}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField control={form.control} name="ref" render={({ field }) => (
            <FormItem>
              <FormLabel>Référence <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input {...field} placeholder="Entrer une référence" style={{ fontFamily: "'PT Sans',sans-serif" }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="client" render={({ field }) => (
            <FormItem>
              <FormLabel>Client <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nom du client" style={{ fontFamily: "'PT Sans',sans-serif" }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="chauffeur" render={({ field }) => (
            <FormItem>
              <FormLabel>Chauffeur</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nom du chauffeur (facultatif)" style={{ fontFamily: "'PT Sans',sans-serif" }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      type="button"
                      className="w-full justify-start text-left font-normal"
                      style={{ fontFamily: "'PT Sans',sans-serif" }}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      {field.value ? format(new Date(field.value), "yyyy-MM-dd") : <span>Choisir une date</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={date => {
                      field.onChange(date ? date.toISOString().substring(0, 10) : "");
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Statut <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <select {...field} className="border rounded px-3 py-2 text-base w-full bg-white" style={{ fontFamily: "'PT Sans',sans-serif" }}>
                  <option value="">Sélectionner…</option>
                  {statusOptions.map(s => <option value={s} key={s}>{s}</option>)}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Description de la mission (facultatif)" style={{ fontFamily: "'PT Sans',sans-serif" }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" className="w-full bg-onelog-bleu text-white text-lg font-bold" disabled={loading}>
            <ChevronRight className="mr-2" />
            {editMode ? "Enregistrer les modifications" : "Créer la mission"}
          </Button>
        </form>
      </Form>
    </main>
  );
}
