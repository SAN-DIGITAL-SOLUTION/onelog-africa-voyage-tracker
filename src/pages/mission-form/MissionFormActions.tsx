
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
    <div className="flex flex-col sm:flex-row gap-4 justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel || (() => navigate(-1))}
        className="w-full sm:w-auto px-8 py-3 text-lg border-gray-300 hover:bg-gray-50"
        disabled={loading}
      >
        Annuler
      </Button>
      <Button
        type={type}
        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        disabled={loading}
      >
        <ChevronRight className="mr-2" size={20} />
        {editMode ? "Enregistrer les modifications" : "Créer la mission"}
      </Button>
    </div>
  );
}
