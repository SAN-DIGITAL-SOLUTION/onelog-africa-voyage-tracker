
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface Props {
  control: any;
  fontFamily?: string;
}

const ClientFields: React.FC<Props> = ({ control, fontFamily }) => (
  <>
    <FormField control={control} name="ref" render={({ field }) => (
      <FormItem>
        <FormLabel>Référence <span className="text-red-500">*</span></FormLabel>
        <FormControl>
          <Input {...field} placeholder="Entrer une référence" style={fontFamily ? { fontFamily } : {}} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
    <FormField control={control} name="client" render={({ field }) => (
      <FormItem>
        <FormLabel>Client <span className="text-red-500">*</span></FormLabel>
        <FormControl>
          <Input {...field} placeholder="Nom du client" style={fontFamily ? { fontFamily } : {}} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  </>
);

export default ClientFields;
