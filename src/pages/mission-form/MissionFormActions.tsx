
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

type MissionFormActionsProps = {
  type?: "submit" | "button";
  loading: boolean;
  editMode: boolean;
  onCancel?: () => void; // Custom cancel, otherwise default navigate
};

export default function MissionFormActions({ type = "submit", loading, editMode, onCancel }: MissionFormActionsProps) {
  const navigate = useNavigate();
  return (
    <div className="flex gap-4 justify-end pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel || (() => navigate(-1))}
        className="w-1/2"
        disabled={loading}
      >
        Annuler
      </Button>
      <Button
        type={type}
        className="w-1/2 bg-onelog-bleu text-white text-lg font-bold"
        disabled={loading}
      >
        <ChevronRight className="mr-2" />
        {editMode ? "Enregistrer les modifications" : "Créer la mission"}
      </Button>
    </div>
  );
}
