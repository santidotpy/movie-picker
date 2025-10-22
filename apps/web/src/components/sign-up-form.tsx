"use client";

import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export default function SignUpForm({
  onSwitchToSignIn,
  className,
  ...props
}: {
  onSwitchToSignIn: () => void;
} & React.ComponentProps<"div">) {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: z
        .object({
          name: z.string().min(2, "Name must be at least 2 characters"),
          email: z.string().email("Invalid email address"),
          password: z.string().min(8, "Password must be at least 8 characters"),
          confirmPassword: z
            .string()
            .min(8, "Password must be at least 8 characters"),
        })
        .refine((v) => v.password === v.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        }),
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign up successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md p-6 flex flex-col gap-6",
        className
      )}
      {...props}
    >
      <Card className="border-muted/60">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup className="space-y-5">
              {/* Name */}
              <form.Field name="name">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="John Doe"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.length > 0 ? (
                      <FieldDescription className="text-destructive">
                        {field.state.meta.errors[0]?.message}
                      </FieldDescription>
                    ) : (
                      <FieldDescription>
                        How should we call you?
                      </FieldDescription>
                    )}
                  </Field>
                )}
              </form.Field>

              {/* Email */}
              <form.Field name="email">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="m@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.length > 0 ? (
                      <FieldDescription className="text-destructive">
                        {field.state.meta.errors[0]?.message}
                      </FieldDescription>
                    ) : (
                      <FieldDescription>
                        We’ll never share your email.
                      </FieldDescription>
                    )}
                  </Field>
                )}
              </form.Field>

              {/* Password + Confirm */}
              <Field className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <form.Field name="password">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          placeholder="********"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <FieldDescription className="text-destructive">
                            {field.state.meta.errors[0]?.message}
                          </FieldDescription>
                        )}
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="confirmPassword">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>
                          Confirm Password
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value ?? ""}
                          type="password"
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <FieldDescription className="text-destructive">
                            {field.state.meta.errors[0]?.message}
                          </FieldDescription>
                        )}
                      </Field>
                    )}
                  </form.Field>
                </div>

                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              {/* Submit + Switch to Sign in */}
              <form.Subscribe>
                {(state) => (
                  <Field className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!state.canSubmit || state.isSubmitting}
                    >
                      {state.isSubmitting ? "Submitting..." : "Create Account"}
                    </Button>
                    <FieldDescription className="text-center">
                      Already have an account?{" "}
                      <Button
                        type="button"
                        variant="link"
                        className="px-1"
                        onClick={onSwitchToSignIn}
                      >
                        Sign in
                      </Button>
                    </FieldDescription>
                  </Field>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
