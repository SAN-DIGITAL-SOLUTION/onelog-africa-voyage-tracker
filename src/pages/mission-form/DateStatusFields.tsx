
import React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface Props {
  control: any;
  datePickerOpen: boolean;
  setDatePickerOpen: (v: boolean) => void;
  statusOptions: string[];
  fontFamily?: string;
}

const DateStatusFields: React.FC<Props> = ({
  control,
  datePickerOpen,
  setDatePickerOpen,
  statusOptions,
  fontFamily,
}) => (
  <>
    <FormField control={control} name="date" render={({ field }) => (
      <FormItem>
        <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                type="button"
                className="w-full justify-start text-left font-normal"
                style={fontFamily ? { fontFamily } : {}}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {field.value ? format(new Date(field.value), "yyyy-MM-dd") : <span>Choisir une date</span>}
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value ? new Date(field.value) : undefined}
              onSelect={date => {
                field.onChange(date ? date.toISOString().substring(0, 10) : "");
                setDatePickerOpen(false);
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )} />
    <FormField control={control} name="status" render={({ field }) => (
      <FormItem>
        <FormLabel>Statut <span className="text-red-500">*</span></FormLabel>
        <FormControl>
          <select {...field} className="border rounded px-3 py-2 text-base w-full bg-white" style={fontFamily ? { fontFamily } : {}}>
            <option value="">Sélectionner…</option>
            {statusOptions.map(s => <option value={s} key={s}>{s}</option>)}
          </select>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  </>
);

export default DateStatusFields;
