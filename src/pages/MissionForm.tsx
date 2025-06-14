
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Form,
} from "@/components/ui/form";
import ClientFields from "./mission-form/ClientFields";
import DateStatusFields from "./mission-form/DateStatusFields";
import ChauffeurSelector from "./mission-form/ChauffeurSelector";
import DescriptionField from "./mission-form/DescriptionField";
import MissionFormSection from "./mission-form/MissionFormSection";
import MissionFormActions from "./mission-form/MissionFormActions";

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
        const { error } = await supabase.from("missions").update({
          ...values,
          updated_at: new Date().toISOString()
        }).eq("id", params.id);
        if (error) throw error;
        toast({ title: "Mission mise à jour", description: "Les modifications ont été enregistrées." });
        navigate(`/missions/${params.id}`);
      } else {
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

  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const fontFamily = "'PT Sans',sans-serif";

  return (
    <main className="container mx-auto pt-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily }}>
        {editMode ? "Éditer la mission" : "Nouvelle mission"}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <MissionFormSection title="Client" fontFamily={fontFamily}>
            <ClientFields control={form.control} fontFamily={fontFamily} />
          </MissionFormSection>
          <MissionFormSection title="Chauffeur" fontFamily={fontFamily}>
            <ChauffeurSelector control={form.control} fontFamily={fontFamily} />
          </MissionFormSection>
          <MissionFormSection title="Dates & Statut" fontFamily={fontFamily}>
            <DateStatusFields
              control={form.control}
              datePickerOpen={datePickerOpen}
              setDatePickerOpen={setDatePickerOpen}
              statusOptions={statusOptions}
              fontFamily={fontFamily}
            />
          </MissionFormSection>
          <MissionFormSection title="Description" fontFamily={fontFamily}>
            <DescriptionField control={form.control} fontFamily={fontFamily} />
          </MissionFormSection>
          <MissionFormActions loading={loading} editMode={editMode} />
        </form>
      </Form>
    </main>
  );
}
