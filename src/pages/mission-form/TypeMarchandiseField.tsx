
import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

export default function TypeMarchandiseField({ control, fontFamily }: { control: any, fontFamily?: string }) {
  return (
    <FormField
      control={control}
      name="type_de_marchandise"
      render={({ field }) => (
        <FormItem>
          <FormLabel style={fontFamily ? { fontFamily } : {}}>Type de marchandise</FormLabel>
          <FormControl>
            <Input placeholder="Ex: Produits pharmaceutiques" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
