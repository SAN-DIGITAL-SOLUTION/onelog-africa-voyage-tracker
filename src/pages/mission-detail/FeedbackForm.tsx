import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const feedbackSchema = z.object({
  rating: z.number().min(1, "Veuillez donner une note").max(5, "La note maximum est 5"),
  comment: z.string().optional(),
  client_name: z.string().optional(),
  client_email: z.string().email("Email invalide").optional().or(z.literal("")),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

type FeedbackFormProps = {
  missionId: string;
  open: boolean;
  onClose: () => void;
};

export default function FeedbackForm({ missionId, open, onClose }: FeedbackFormProps) {
  const queryClient = useQueryClient();
  const [hoveredStar, setHoveredStar] = React.useState<number | null>(null);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      comment: "",
      client_name: "",
      client_email: "",
    },
  });

  const { mutate: submitFeedback, isPending } = useMutation({
    mutationFn: async (values: FeedbackFormData) => {
      const { error } = await supabase.from("mission_feedback").insert({
        mission_id: missionId,
        rating: values.rating,
        comment: values.comment || null,
        client_name: values.client_name || null,
        client_email: values.client_email || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: "Évaluation envoyée",
        description: "Merci pour votre retour !",
      });
      queryClient.invalidateQueries({ queryKey: ["mission-feedback", missionId] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const watchedRating = form.watch("rating");

  const handleStarClick = (rating: number) => {
    form.setValue("rating", rating);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isActive = starValue <= (hoveredStar || watchedRating);
      
      return (
        <button
          key={i}
          type="button"
          className="p-1 transition-transform hover:scale-110"
          onMouseEnter={() => setHoveredStar(starValue)}
          onMouseLeave={() => setHoveredStar(null)}
          onClick={() => handleStarClick(starValue)}
        >
          <Star
            size={24}
            className={
              isActive
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            }
          />
        </button>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Évaluer cette mission</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => submitFeedback(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note générale *</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1">
                      {renderStars()}
                      {watchedRating > 0 && (
                        <span className="ml-2 text-sm text-gray-600">
                          {watchedRating}/5
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Cliquez sur les étoiles pour donner votre note
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre nom (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Jean Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre email (optionnel)</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="ex: jean@email.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Pour vous recontacter si nécessaire
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commentaire (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Partagez votre expérience..."
                      className="resize-y min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isPending || watchedRating === 0}
              >
                {isPending ? (
                  <span className="animate-spin rounded-full border-2 border-t-transparent border-white w-4 h-4 inline-block mr-2" />
                ) : null}
                Envoyer l'évaluation
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
