import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  EyeIcon,
  EyeOff,
  LoaderCircle,
  LockPasswordIcon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";

export function PasswordResetConfirmForm() {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = React.useState("");
  const [reNewPassword, setReNewPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showRePassword, setShowRePassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const passwordsMatch = newPassword === reNewPassword;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!uid || !token) {
      setError("Invalid password reset link.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.auth.resetPasswordConfirm({
        uid,
        token: decodeURIComponent(token),
        new_password: newPassword,
        re_new_password: reNewPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      const data = err.response?.data;
      const message =
        data?.new_password?.[0] ||
        data?.token?.[0] ||
        data?.uid?.[0] ||
        data?.non_field_errors?.[0] ||
        data?.detail ||
        "Could not reset password. Please request a new reset link.";
      setError(message);
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
            Password updated
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You can now sign in with your new password.
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
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="new-password">New Password</FieldLabel>
          <div className="relative">
            <HugeiconsIcon
              icon={LockPasswordIcon}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon
                icon={showPassword ? EyeOff : EyeIcon}
                strokeWidth={2}
                size={20}
              />
            </button>
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-new-password">
            Confirm New Password
          </FieldLabel>
          <div className="relative">
            <HugeiconsIcon
              icon={LockPasswordIcon}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              id="confirm-new-password"
              type={showRePassword ? "text" : "password"}
              value={reNewPassword}
              onChange={(event) => setReNewPassword(event.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowRePassword(!showRePassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon
                icon={showRePassword ? EyeOff : EyeIcon}
                strokeWidth={2}
                size={20}
              />
            </button>
          </div>
          {reNewPassword && !passwordsMatch && (
            <p className="mt-1 text-sm text-destructive">
              Passwords do not match.
            </p>
          )}
        </Field>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !passwordsMatch}
        >
          {loading ? (
            <>
              <span className="animate-spin">
                <HugeiconsIcon icon={LoaderCircle} strokeWidth={2} size={20} />
              </span>
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
