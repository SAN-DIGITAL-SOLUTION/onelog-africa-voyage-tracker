
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface Props {
  control: any;
  fontFamily?: string;
}

const ChauffeurSelector: React.FC<Props> = ({ control, fontFamily }) => (
  <FormField control={control} name="chauffeur" render={({ field }) => (
    <FormItem>
      <FormLabel>Chauffeur</FormLabel>
      <FormControl>
        <Input {...field} placeholder="Nom du chauffeur (facultatif)" style={fontFamily ? { fontFamily } : {}} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )} />
);

export default ChauffeurSelector;
