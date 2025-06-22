import { useForm } from "react-hook-form";
import { useCreateDemande } from "@/hooks/useCreateDemande";

export default function DemandeForm({ onSuccess }: { onSuccess: (demande: any) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { createDemande, loading, error } = useCreateDemande();

  const onSubmit = async (data: any) => {
    const demande = await createDemande(data);
    if (demande) onSuccess(demande);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <input {...register("typeMarchandise", { required: true })} placeholder="Type de marchandise" className="input" />
      {errors.typeMarchandise && <span className="text-red-500">Champ requis</span>}
      <input type="number" {...register("volume", { required: true, min: 1 })} placeholder="Volume (kg ou m3)" className="input" />
      {errors.volume && <span className="text-red-500">Champ requis &gt; 0</span>}
      <input {...register("adresseDepart", { required: true })} placeholder="Adresse de départ" className="input" />
      {errors.adresseDepart && <span className="text-red-500">Champ requis</span>}
      <input {...register("adresseArrivee", { required: true })} placeholder="Adresse d’arrivée" className="input" />
      {errors.adresseArrivee && <span className="text-red-500">Champ requis</span>}
      <input type="date" {...register("dateSouhaitee", { required: true })} className="input" />
      {errors.dateSouhaitee && <span className="text-red-500">Champ requis</span>}
      <input {...register("contact", { required: true })} placeholder="Téléphone ou email" className="input" />
      {errors.contact && <span className="text-red-500">Champ requis</span>}
      <textarea {...register("instructions")} placeholder="Instructions (optionnel)" className="input" />
      <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
        {loading ? "Envoi..." : "Envoyer la demande"}
      </button>
      {error && <p className="text-red-600 text-center">{error}</p>}
    </form>
  );
}
