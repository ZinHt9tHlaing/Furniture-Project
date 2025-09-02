import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "./Icons";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const emailSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address",
  }),
});

export default function NewLetterForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof emailSchema>) => {
    console.log(values);
    form.reset();
    setLoading(true);
    toast.success("Thanks for joining our newsletter!");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid w-full pr-8 lg:pr-0"
        // autoComplete="off"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="relative space-y-0">
              <FormLabel className="sr-only">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="future@gmail.com"
                  {...field}
                  className="pr-12"
                />
              </FormControl>
              <FormMessage />
              <Button
                type="submit"
                size="icon"
                className="group absolute top-[4px] right-[3.5px] z-20 size-7 cursor-pointer duration-200 active:scale-90"
              >
                {loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Icons.paperPlane
                    className="size-4 duration-200 group-hover:-rotate-12"
                    aria-hidden="true"
                  />
                )}
                <span className="sr-only">Join newsletter</span>
              </Button>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
