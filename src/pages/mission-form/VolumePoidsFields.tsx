
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function VolumePoidsFields({ control, fontFamily }: { control: any, fontFamily?: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <FormField
        control={control}
        name="volume"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel style={fontFamily ? { fontFamily } : {}}>Volume (m³)</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" placeholder="Volume en m³" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="poids"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel style={fontFamily ? { fontFamily } : {}}>Poids (kg)</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" placeholder="Poids en kg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
