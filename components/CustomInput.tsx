import React, { useState } from 'react';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

import { cn } from '@/lib/utils';

import {
  FormField,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';

import { Control, FieldPath } from 'react-hook-form';
import { z } from 'zod';
import { authFormSchema } from '@/lib/utils';

const formSchema = authFormSchema('sign-up');

interface CustomInput {
  control: Control<z.infer<typeof formSchema>>;
  name: FieldPath<z.infer<typeof formSchema>>;
  label: string;
  placeholder: string;
  type?: 'text' | 'date';
}

const CustomInput = ({ control, name, label, placeholder, type = 'text' }: CustomInput) => {
  const { setValue, getValues } = useFormContext();
  const [popoverOpen, setPopoverOpen] = useState(false);
  if (type === 'date') {
    return (
      <FormItem className="flex flex-col">
        <FormLabel className="form-label">{label}</FormLabel>
        <Popover
          open={popoverOpen}
          onOpenChange={(open) => setPopoverOpen(open)}
        >
          <PopoverTrigger asChild>
            <FormControl>
              <div className="relative">
                <Input
                  type="text"
                  value={getValues(name) ? format(new Date(getValues(name)), "yyyy-MM-dd") : ""}
                  onChange={(e) => setValue(name, e.target.value)}
                  placeholder={placeholder}
                  className={cn("input-class",
                    !getValues(name) && "text-muted-foreground"
                  )}
                />
                <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 opacity-50 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 z-50"
            align="start"
            side="bottom"
            sideOffset={5}
          >
            <Calendar
              mode="single"
              selected={getValues(name)}
              onSelect={(date) => {
                setValue(name, date ? format(date, 'yyyy-MM-dd') : '');
                setPopoverOpen(false);
              }}
              disabled={(date) =>
                date > new Date() || date < new Date('1900-01-01')
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    );
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className="form-item">
          <FormLabel className="form-label">{label}</FormLabel>
          <div className="flex w-full flex-col">
            <FormControl>
              <Input
                placeholder={placeholder}
                className="input-class"
                type={name === 'password' ? 'password' : 'text'}
                {...field}
              />
            </FormControl>
            <FormMessage className="form-message mt-2" />
          </div>
        </div>
      )}
    />
  );
};

export default CustomInput;
