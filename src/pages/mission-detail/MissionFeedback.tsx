import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';
import { Star, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

const FEEDBACK_PER_PAGE = 5;

export default function MissionFeedback({ missionId, onAddFeedback }: MissionFeedbackProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch total count
  const { data: totalCount } = useQuery({
    queryKey: ["mission-feedback-count", missionId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("mission_feedback")
        .select("*", { count: "exact", head: true })
        .eq("mission_id", missionId);
      if (error) throw new Error(error.message);
      return count || 0;
    },
    enabled: !!missionId,
  });

  // Fetch paginated feedback
  const { data: feedback, isLoading, error } = useQuery({
    queryKey: ["mission-feedback", missionId, currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * FEEDBACK_PER_PAGE;
      const to = from + FEEDBACK_PER_PAGE - 1;
      
      const { data, error } = await supabase
        .from("mission_feedback")
        .select("*")
        .eq("mission_id", missionId)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw new Error(error.message);
      return data as Feedback[];
    },
    enabled: !!missionId,
  });

  // Fetch average rating (separate query to avoid recalculation on pagination)
  const { data: averageData } = useQuery({
    queryKey: ["mission-feedback-average", missionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mission_feedback")
        .select("rating")
        .eq("mission_id", missionId);
      if (error) throw new Error(error.message);
      
      if (!data || data.length === 0) return null;
      
      const average = data.reduce((sum, f) => sum + f.rating, 0) / data.length;
      return {
        average: average.toFixed(1),
        count: data.length
      };
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

  const totalPages = totalCount ? Math.ceil(totalCount / FEEDBACK_PER_PAGE) : 0;

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
          {averageData && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(parseFloat(averageData.average)))}
              </div>
              <span className="font-medium">{averageData.average}/5</span>
              <span className="text-gray-600 text-sm">
                ({averageData.count} évaluation{averageData.count > 1 ? 's' : ''})
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

          {totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
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
