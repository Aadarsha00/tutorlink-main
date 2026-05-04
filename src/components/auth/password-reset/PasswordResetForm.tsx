import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  MailSend01Icon,
  CheckmarkCircle01Icon,
  LoaderCircle,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";

interface PasswordResetFormProps {
  onSuccess?: (email: string) => void;
}

export function PasswordResetForm({ onSuccess }: PasswordResetFormProps) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.auth.resetPassword({ email });
      setSuccess(true);
      onSuccess?.(email);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
          <HugeiconsIcon
            icon={CheckmarkCircle01Icon}
            strokeWidth={2}
            className="text-white"
            size={34}
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Check your email
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We sent password reset instructions to{" "}
            <strong className="font-semibold text-foreground">{email}</strong>.
            Open the link in that email to create a new password.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link to="/login">Back to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel htmlFor="reset-email">Email</FieldLabel>
          <div className="relative">
            <HugeiconsIcon
              icon={Mail01Icon}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              id="reset-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </Field>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Field orientation="horizontal" className="gap-3">
          <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700" disabled={loading}>
            {loading ? (
              <>
                <span className="animate-spin">
                  <HugeiconsIcon
                    icon={LoaderCircle}
                    strokeWidth={2}
                    size={20}
                  />
                </span>
                Sending...
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={MailSend01Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Send Reset Email
              </>
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
