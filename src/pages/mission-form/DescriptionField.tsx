
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  control: any;
  fontFamily?: string;
}

const DescriptionField: React.FC<Props> = ({ control, fontFamily }) => (
  <FormField control={control} name="description" render={({ field }) => (
    <FormItem>
      <FormLabel>Description</FormLabel>
      <FormControl>
        <Textarea {...field} placeholder="Description de la mission (facultatif)" style={fontFamily ? { fontFamily } : {}} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )} />
);

export default DescriptionField;
