
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function LieuFields({ control, fontFamily }: { control: any, fontFamily?: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <FormField
        control={control}
        name="lieu_enlevement"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel style={fontFamily ? { fontFamily } : {}}>Lieu d'enlèvement</FormLabel>
            <FormControl>
              <Input placeholder="Lieu d'enlèvement" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="lieu_livraison"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel style={fontFamily ? { fontFamily } : {}}>Lieu de livraison</FormLabel>
            <FormControl>
              <Input placeholder="Lieu de livraison" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
