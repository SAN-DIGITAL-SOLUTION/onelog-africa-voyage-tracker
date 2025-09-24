
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from '@/lib/supabase';
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
import TypeMarchandiseField from "./mission-form/TypeMarchandiseField";
import VolumePoidsFields from "./mission-form/VolumePoidsFields";
import LieuFields from "./mission-form/LieuFields";
import MissionDocumentsField, { MissionDocUpload } from "./mission-form/MissionDocumentsField";

const missionSchema = z.object({
  ref: z.string().min(1, "Référence obligatoire"),
  client: z.string().min(1, "Client obligatoire"),
  chauffeur: z.string().optional(),
  date: z.string().min(1, "Date obligatoire"),
  status: z.string().min(1, "Statut obligatoire"),
  description: z.string().optional(),
  type_de_marchandise: z.string().optional(),
  volume: z.preprocess(val => (val === "" ? undefined : Number(val)), z.number().optional()),
  poids: z.preprocess(val => (val === "" ? undefined : Number(val)), z.number().optional()),
  lieu_enlevement: z.string().optional(),
  lieu_livraison: z.string().optional(),
  documents: z.any().optional(), // Handled separately
});

const statusOptions = ["En cours", "Terminée", "Annulée"];

export default function MissionForm({ editMode = false }: { editMode?: boolean }) {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [defaultValues, setDefaultValues] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  // Documents state (outside react-hook-form, handled separately since upload is async)
  const [documents, setDocuments] = React.useState<MissionDocUpload[]>([]);

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

  React.useEffect(() => {
    // On editing, prefill document list from backend if present in defaultValues
    if (editMode && defaultValues && defaultValues.documents) {
      setDocuments(defaultValues.documents);
    }
  }, [defaultValues, editMode]);

  const form = useForm({
    resolver: zodResolver(missionSchema),
    defaultValues: defaultValues || {
      ref: "",
      client: "",
      chauffeur: "",
      date: "",
      status: "",
      description: "",
      type_de_marchandise: "",
      volume: undefined,
      poids: undefined,
      lieu_enlevement: "",
      lieu_livraison: "",
      documents: []
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
      let missionId = params.id;
      // 1. Handle mission creation/updating (Mission)
      if (editMode && params.id) {
        const { error } = await supabase.from("missions").update({
          ...values,
          updated_at: new Date().toISOString()
        }).eq("id", params.id);
        if (error) throw error;
        missionId = params.id;
        toast({ title: "Mission mise à jour", description: "Les modifications ont été enregistrées." });
        navigate(`/missions/${params.id}`);
      } else {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error("Utilisateur non authentifié");
        const { data: insertData, error } = await supabase.from("missions").insert({
          ...values,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        missionId = insertData.id;
        toast({ title: "Mission créée", description: "La mission a été ajoutée." });
      }

      // 2. Handle documents: save entries to missions_documents if present
      if (documents.length > 0 && missionId) {
        // Save only new documents that may not be already associated
        for (const doc of documents) {
          if (!doc.id) {
            const user = (await supabase.auth.getUser()).data.user;
            await supabase.from("missions_documents").insert({
              mission_id: missionId,
              user_id: user.id,
              filename: doc.filename,
              url: doc.url
            });
          }
        }
      }

      navigate(editMode ? `/missions/${params.id}` : "/missions");
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const fontFamily = "'PT Sans',sans-serif";

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 mb-8 border border-gray-100 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {editMode ? "Éditer la mission" : "Nouvelle mission"}
              </h1>
              <p className="text-gray-600 text-lg">
                {editMode ? "Modifiez les informations de votre mission" : "Créez une nouvelle mission de transport"}
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
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
                </div>

                <div className="space-y-6">
                  <MissionFormSection title="Informations marchandise" fontFamily={fontFamily}>
                    <TypeMarchandiseField control={form.control} fontFamily={fontFamily} />
                    <VolumePoidsFields control={form.control} fontFamily={fontFamily} />
                    <LieuFields control={form.control} fontFamily={fontFamily} />
                  </MissionFormSection>
                  
                  <MissionFormSection title="Description" fontFamily={fontFamily}>
                    <DescriptionField control={form.control} fontFamily={fontFamily} />
                  </MissionFormSection>
                  
                  <MissionFormSection title="Documents joints" fontFamily={fontFamily}>
                    <MissionDocumentsField
                      missionId={params.id}
                      documents={documents}
                      setDocuments={setDocuments}
                      fontFamily={fontFamily}
                      disabled={loading}
                    />
                  </MissionFormSection>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <MissionFormActions loading={loading} editMode={editMode} />
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
