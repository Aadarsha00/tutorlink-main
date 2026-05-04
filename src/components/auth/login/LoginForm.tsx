import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  LockPasswordIcon,
  EyeIcon,
  Login01Icon,
  EyeOff,
  LoaderCircle,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [verificationBlocked, setVerificationBlocked] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerificationBlocked(false);
    setResendMessage("");
    setLoading(true);

    try {
      await login({ email, password });
      onSuccess?.();
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Invalid email or password";
      const code = err.response?.data?.code;
      const needsVerification =
        code === "email_not_verified" ||
        detail.toLowerCase().includes("verify your email");

      setError(detail);
      setVerificationBlocked(needsVerification);
    } finally {
      setLoading(false);
    }
  };

  const handleResendActivation = async () => {
    setResending(true);
    setResendMessage("");

    try {
      await api.auth.resendActivation(email);
      setResendMessage("Activation email sent. Please check your inbox and spam folder.");
    } catch (err: any) {
      setResendMessage(
        err.response?.data?.email?.[0] ||
          err.response?.data?.detail ||
          "Could not resend activation email. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <div className="relative">
            <HugeiconsIcon
              icon={Mail01Icon}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              id="login-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <div className="relative">
            <HugeiconsIcon
              icon={LockPasswordIcon}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <HugeiconsIcon icon={EyeOff} strokeWidth={2} size={20} />
              ) : (
                <HugeiconsIcon icon={EyeIcon} strokeWidth={2} size={20} />
              )}
            </button>
          </div>
        </Field>

        {error && (
          <div className="space-y-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <p>{error}</p>
            {verificationBlocked && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleResendActivation}
                disabled={resending || !email}
              >
                {resending ? "Sending..." : "Resend activation email"}
              </Button>
            )}
            {resendMessage && (
              <p className="text-muted-foreground">{resendMessage}</p>
            )}
          </div>
        )}

        <Field orientation="horizontal" className="gap-3">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? (
              <>
                <span className="animate-spin">
                  <HugeiconsIcon
                    icon={LoaderCircle}
                    strokeWidth={2}
                    size={20}
                  />
                </span>
                Signing in...
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={Login01Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Sign In
              </>
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
