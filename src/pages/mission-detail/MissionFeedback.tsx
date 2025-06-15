
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Feedback = {
  id: string;
  rating: number;
  comment?: string;
  client_name?: string;
  client_email?: string;
  created_at: string;
};

type MissionFeedbackProps = {
  missionId: string;
  onAddFeedback: () => void;
};

export default function MissionFeedback({ missionId, onAddFeedback }: MissionFeedbackProps) {
  const { data: feedback, isLoading, error } = useQuery({
    queryKey: ["mission-feedback", missionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mission_feedback")
        .select("*")
        .eq("mission_id", missionId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as Feedback[];
    },
    enabled: !!missionId,
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  const averageRating = feedback?.length 
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <section className="pt-4">
        <h3 className="font-semibold mb-3">Évaluations client</h3>
        <div className="text-center py-4">
          <span className="animate-spin h-6 w-6 border-4 border-onelog-bleu border-t-transparent rounded-full inline-block" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pt-4">
        <h3 className="font-semibold mb-3">Évaluations client</h3>
        <div className="text-red-600 text-sm">Erreur lors du chargement des évaluations</div>
      </section>
    );
  }

  return (
    <section className="pt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Évaluations client</h3>
        <Button onClick={onAddFeedback} variant="outline" size="sm">
          <Star size={16} className="mr-1" />
          Ajouter une évaluation
        </Button>
      </div>

      {feedback && feedback.length > 0 ? (
        <div className="space-y-4">
          {averageRating && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(parseFloat(averageRating)))}
              </div>
              <span className="font-medium">{averageRating}/5</span>
              <span className="text-gray-600 text-sm">
                ({feedback.length} évaluation{feedback.length > 1 ? 's' : ''})
              </span>
            </div>
          )}

          {feedback.map((item) => (
            <Card key={item.id} className="border-l-4 border-l-onelog-bleu">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <span className="font-medium text-sm">
                      {item.client_name || "Client anonyme"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(item.rating)}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </CardHeader>
              {item.comment && (
                <CardContent className="pt-0">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{item.comment}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Star size={32} className="mx-auto mb-2 text-gray-300" />
          <p>Aucune évaluation pour cette mission</p>
          <p className="text-sm">Les clients pourront évaluer cette mission une fois terminée</p>
        </div>
      )}
    </section>
  );
}
