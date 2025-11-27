import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useActionData, useNavigation, useSubmit } from "react-router";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icons } from "../Icons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { PasswordInput } from "./PasswordInput";

const FormSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be 8 digits.")
    .max(8, "Password must be 8 digits.")
    .regex(/^\d+$/, "Password must be numbers."),
  confirmPassword: z
    .string()
    .min(8, "Confirm Password must be 8 digits.")
    .max(8, "Confirm Password must be 8 digits.")
    .regex(/^\d+$/, "Confirm Password must be numbers."),
});

export function ConfirmPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData() as {
    message?: string;
    error?: string;
  };

  const submitting = navigation.state === "submitting";

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    submit(values, { method: "post", action: "/register/confirm-password" });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <Link to="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <Icons.logo className="mr-2 h-6 w-6" aria-hidden="true" />
            </div>
            <span className="sr-only">Confirm Password</span>
          </Link>
          <h1 className="text-xl font-bold">Please confirm your password</h1>
          <div className="text-center text-sm">
            Passwords must be 8 digits long and contain only numbers. They must
            match.
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                autoComplete="off"
              >
                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          required
                          // minLength={8}
                          // maxLength={8}
                          inputMode="numeric"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          required
                          // minLength={8}
                          // maxLength={8}
                          inputMode="numeric"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {actionData && (
                  <div className="flex gap-2">
                    <p className="text-xs text-red-400">
                      {actionData?.message}
                    </p>
                    <Link
                      to="/register"
                      className="text-xs underline underline-offset-4"
                    >
                      Go back to register
                    </Link>
                  </div>
                )}
                {actionData && (
                  <p className="text-xs font-medium text-red-600">
                    {actionData.message}
                  </p>
                )}
                <div className="grid gap-4">
                  <Button
                    type="submit"
                    className="mt-4 w-full cursor-pointer duration-200 active:scale-95"
                    disabled={form.formState.isSubmitting}
                  >
                    {submitting ? "Submitting..." : "Confirm"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
