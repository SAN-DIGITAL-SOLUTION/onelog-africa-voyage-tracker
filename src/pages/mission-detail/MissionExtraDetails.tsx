
import React, { useEffect, useState } from "react";
import { Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Mission = {
  id: string;
  description?: string;
};

type MissionDocument = {
  id: string;
  filename: string;
  url: string;
};

type Props = {
  mission: Mission;
};

export default function MissionExtraDetails({ mission }: Props) {
  const [docs, setDocs] = useState<MissionDocument[]>([]);

  useEffect(() => {
    // Fetch docs attached to this mission
    async function fetchDocuments() {
      if (!mission.id) return;
      const { data, error } = await supabase
        .from("missions_documents")
        .select("*")
        .eq("mission_id", mission.id)
        .order("uploaded_at", { ascending: true });
      if (!error && data) setDocs(data);
    }
    fetchDocuments();
  }, [mission.id]);

  return (
    <section className="pt-2">
      <div className="text-sm text-gray-600">Description</div>
      <div className="font-semibold mb-3">
        {mission.description || <span className="italic text-onelog-nuit/40">Aucune</span>}
      </div>
      <div className="text-sm text-gray-600">Documents joints</div>
      {docs.length === 0 ? (
        <div className="italic text-onelog-nuit/40">Aucun document joint</div>
      ) : (
        <ul className="space-y-1 mt-1">
          {docs.map(doc => (
            <li key={doc.id} className="flex items-center gap-2">
              <Paperclip size={16} className="text-onelog-bleu" />
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="underline text-primary">{doc.filename}</a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
