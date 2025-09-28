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
import { toast } from "sonner";
import { Icons } from "../Icons";

const quantitySchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

function Editable() {
  const form = useForm<z.infer<typeof quantitySchema>>({
    resolver: zodResolver(quantitySchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const onSubmit = (values: z.infer<typeof quantitySchema>) => {
    console.log(values);
    toast.success("Products added to cart successfully.");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full justify-between"
      >
        <div className="flex items-center">
          {/* Minus Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 shrink-0 cursor-pointer rounded-r-none duration-200 active:scale-90"
          >
            <Icons.minus className="size-3" aria-hidden="true" />
            <span className="sr-only">Remove one item</span>
          </Button>
          {/* Quantity input */}
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="sr-only">Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={9999}
                    {...field}
                    className="h-8 w-16 rounded-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Plus Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 shrink-0 cursor-pointer rounded-l-none duration-200 active:scale-90"
          >
            <Icons.plus className="size-3" aria-hidden="true" />
            <span className="sr-only">Add one item</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2.5">
          {/* Add To Cart */}
          <Button
            type="button"
            aria-label="Delete cart item"
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer duration-200 active:scale-90"
          >
            <Icons.trash className="size-5 text-red-600" aria-hidden="true" />
            <span className="sr-only">Delete item</span>
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default Editable;
