import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Paperclip, X } from "lucide-react";
import { supabase } from '@/lib/supabase';

export type MissionDocUpload = { id?: string, filename: string, url: string };

type MissionDocumentsFieldProps = {
  missionId?: string;
  documents: MissionDocUpload[];
  setDocuments: (docs: MissionDocUpload[]) => void;
  fontFamily?: string;
  disabled?: boolean;
};

export default function MissionDocumentsField({ missionId, documents, setDocuments, fontFamily, disabled }: MissionDocumentsFieldProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;
    let uploadToast: any;
    try {
      uploadToast = toast({ title: "Envoi du document...", description: file.name });
      // Store file in Supabase Storage (bucket per mission)
      const bucket = "missions-documents";
      const filepath = `${missionId || "temp"}/${Date.now()}-${file.name}`;
      let { data, error } = await supabase.storage.from(bucket).upload(filepath, file);
      if (error) throw new Error(error.message);
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filepath);
      setDocuments([...documents, { filename: file.name, url: urlData.publicUrl }]);
      toast({ title: "Document ajouté", description: file.name });
    } catch (err: any) {
      toast({ title: "Erreur lors de l'envoi", description: err.message, variant: "destructive" });
    } finally {
      if (uploadToast?.dismiss) uploadToast.dismiss();
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeDoc = (idx: number) => {
    setDocuments(documents.filter((_, i) => i !== idx));
  };

  return (
    <FormItem>
      <FormLabel style={fontFamily ? { fontFamily } : {}}>Documents joints</FormLabel>
      <div className="flex flex-col gap-2">
        {documents.length > 0 && (
          <ul className="mb-1">
            {documents.map((doc, i) => (
              <li key={doc.url} className="flex items-center gap-2">
                <Paperclip size={16} className="text-onelog-bleu" />
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="underline text-primary">{doc.filename}</a>
                {!disabled && (
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeDoc(i)}>
                    <X size={14} />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        <FormControl>
          <input
            type="file"
            style={{ display: "none" }}
            accept=".pdf,.png,.jpg,.jpeg"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={disabled}
          />
        </FormControl>
        {!disabled && (
          <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} className="gap-1">
            <Paperclip size={16} /> Ajouter un document
          </Button>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
}
